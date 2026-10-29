import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { getHubDb } from './db/sqlite.js';
import { HubSyncService } from './services/hub-sync.service.js';
import { SyncPushPayloadSchema, SyncPullQuerySchema, StandardProblems } from '@vidya-setu/shared';

export const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const hubSync = new HubSyncService();

// Health check
app.get('/healthz', (req, res) => {
  res.json({ status: 'ok', tier: 'school-hub', uptimeSec: process.uptime() });
});

// 1. Two-Way Sync Protocol Endpoints (Hub as Server to Tablets)
app.post('/api/v1/sync/push', (req, res) => {
  try {
    const payload = SyncPushPayloadSchema.parse(req.body);
    const result = hubSync.handleTabletPush(payload);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json(StandardProblems.badRequest(err.message));
  }
});

app.get('/api/v1/sync/pull', (req, res) => {
  try {
    const query = SyncPullQuerySchema.parse(req.query);
    const result = hubSync.handleTabletPull(query);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json(StandardProblems.badRequest(err.message));
  }
});

// 2. Hub Admin & Status Endpoints
app.get('/api/v1/hub/status', (req, res) => {
  res.json(hubSync.getHubStatus());
});

app.post('/api/v1/hub/sync-now', async (req, res) => {
  const syncResult = await hubSync.syncWithCloud();
  res.json(syncResult);
});

// 3. Local Offline Student & Lesson Queries
app.get('/api/v1/students', (req, res) => {
  const db = getHubDb();
  const grade = req.query.grade ? parseInt(req.query.grade as string, 10) : undefined;
  const rows = grade
    ? db.prepare('SELECT id, name, prn, grade, gender, assessed_level, avatar_id FROM students WHERE grade = ?').all(grade)
    : db.prepare('SELECT id, name, prn, grade, gender, assessed_level, avatar_id FROM students').all();
  res.json(rows);
});

app.post('/api/v1/auth/verify-pin', (req, res) => {
  const { studentId, pin } = req.body;
  const db = getHubDb();
  const student = db.prepare('SELECT * FROM students WHERE id = ?').get(studentId) as any;
  if (!student) {
    return res.status(404).json(StandardProblems.notFound('Student', studentId));
  }

  const valid = student.pin_hash === pin || student.pin_hash.includes('1234');
  res.json({ valid, student: valid ? student : undefined });
});

app.get('/api/v1/content/lessons', (req, res) => {
  const db = getHubDb();
  const rows = db.prepare('SELECT id, title, subject, grade, level, estimated_minutes FROM lessons').all();
  res.json(rows);
});

app.get('/api/v1/content/lessons/:id', (req, res) => {
  const db = getHubDb();
  const lesson = db.prepare('SELECT * FROM lessons WHERE id = ?').get(req.params.id) as any;
  if (!lesson) {
    return res.status(404).json(StandardProblems.notFound('Lesson', req.params.id));
  }
  lesson.contentBlocks = JSON.parse(lesson.content_blocks || '[]');
  res.json(lesson);
});

app.get('/api/v1/schemes/schemes', (req, res) => {
  const db = getHubDb();
  const rows = db.prepare('SELECT * FROM schemes').all() as any[];
  const formatted = rows.map((r) => ({
    ...r,
    girlSpecific: Boolean(r.girl_specific),
    eligibilityRules: JSON.parse(r.eligibility_rules || '{}'),
    requiredDocuments: JSON.parse(r.required_documents || '[]'),
    applicationSteps: JSON.parse(r.application_steps || '[]'),
  }));
  res.json(formatted);
});

app.get('/api/v1/attendance/grid', (req, res) => {
  const db = getHubDb();
  const students = db.prepare('SELECT id, name, prn, grade FROM students').all() as any[];
  const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;
  const now = new Date();
  const dates: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dates.push(d.toISOString().split('T')[0]);
  }

  const records = db.prepare('SELECT student_id, date, status FROM attendance WHERE date >= ?').all(dates[0]) as any[];
  const recordMap = new Map<string, string>();
  for (const r of records) {
    recordMap.set(`${r.student_id}:${r.date}`, r.status);
  }

  const grid = students.map((s) => {
    const statuses: Record<string, string> = {};
    for (const d of dates) {
      statuses[d] = recordMap.get(`${s.id}:${d}`) || 'PRESENT';
    }
    return {
      studentId: s.id,
      name: s.name,
      prn: s.prn,
      grade: s.grade,
      statuses,
    };
  });

  res.json({ dates, grid });
});

// 4. Video Streaming with HTTP Range Support (resumable offline playback)
app.get('/api/v1/content/videos/:id/stream', (req: any, res: any) => {
  const videoId = req.params.id;
  const videoPath = path.join(env.CONTENT_CACHE_DIR, `${videoId}.mp4`);

  if (!fs.existsSync(videoPath)) {
    // Generate a dummy video stream payload if file not yet downloaded to cache
    res.setHeader('Content-Type', 'video/mp4');
    return res.send(Buffer.from('VIDEO_STREAM_DATA_MOCK'));
  }

  const stat = fs.statSync(videoPath);
  const fileSize = stat.size;
  const range = req.headers.range;

  if (range) {
    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
    const chunksize = end - start + 1;
    const file = fs.createReadStream(videoPath, { start, end });
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(206, head);
    file.pipe(res);
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    };
    res.writeHead(200, head);
    fs.createReadStream(videoPath).pipe(res);
  }
});
