export type UserRole =
  | 'STUDENT'
  | 'TEACHER'
  | 'GUARDIAN'
  | 'CONTENT_ADMIN'
  | 'DISTRICT_ADMIN';

export type AdminScope = 'CONTENT' | 'DISTRICT';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE';

export type AttendanceSource = 'TEACHER' | 'DEVICE_AUTO';

export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'IMAGE_CHOICE';

export type AssessmentMode = 'QUIZ' | 'ADAPTIVE';

export type LessonStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type VideoTranscodeStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';

export type NotificationChannel =
  | 'ON_DEVICE'
  | 'PRINT_SLIP'
  | 'SMS'
  | 'COMMUNITY_BOARD';

export type NotificationStatus = 'PENDING' | 'DELIVERED' | 'FAILED';

export type SyncOp = 'INSERT' | 'UPDATE' | 'DELETE';

export type SyncItemStatus = 'applied' | 'duplicate' | 'rejected' | 'conflict';

export type SupportedLanguage = 'en' | 'hi' | 'mr';

/**
 * Base fields required on every synchronized entity
 */
export interface SyncedEntity {
  id: string; // UUIDv7
  schoolId: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  deletedAt: string | null; // Soft delete ISO string or null
  version: number;
  deviceId: string;
  hlc?: string; // Hybrid logical clock string (physicalMs:counter:nodeId)
}

export interface District {
  id: string;
  name: string;
  state: string;
  createdAt: string;
  updatedAt: string;
}

export interface School {
  id: string;
  districtId: string;
  name: string;
  address: string;
  registerNo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  schoolId: string;
  type: 'TABLET' | 'HUB_PC' | 'PHONE';
  name: string;
  pairedAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
  tokenHash?: string;
}

export interface User {
  id: string;
  schoolId?: string | null;
  role: UserRole;
  language: SupportedLanguage;
  username: string;
  email?: string | null;
  phone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile extends SyncedEntity {
  userId?: string;
  name: string;
  prn: string; // Permanent Registration Number
  grade: number; // 1-10
  gender: Gender;
  dob?: string;
  assessedLevel: number; // 1-5 (TaRL assessed level)
  avatarId: string;
  pinHash: string; // 4-digit PIN argon2/bcrypt or local hash
  parentalConsent: boolean;
  guardianIds?: string[];
}

export interface TeacherProfile extends SyncedEntity {
  userId?: string;
  teacherId: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface GuardianProfile {
  id: string;
  name: string;
  phone?: string | null;
  relation: string;
  studentIds: string[];
}

export interface AdministratorProfile {
  id: string;
  userId: string;
  scope: AdminScope;
  districtId?: string | null;
}

export interface ContentBlock {
  id: string;
  type: 'HEADING' | 'PARAGRAPH' | 'IMAGE' | 'CALLOUT' | 'AUDIO';
  content: string;
  audioUrl?: string;
  caption?: string;
}

export interface Lesson extends SyncedEntity {
  title: string;
  subject: string;
  grade: number;
  level: number; // 1-5
  contentBlocks: ContentBlock[];
  audioUrl?: string | null;
  status: LessonStatus;
  estimatedMinutes: number;
  translations?: Record<SupportedLanguage, { title: string; contentBlocks: ContentBlock[] }>;
}

export interface Video extends SyncedEntity {
  lessonId: string;
  title: string;
  storageKey: string;
  durationSec: number;
  bitrateKbps: number;
  sizeBytes: number;
  sha256: string;
  thumbnailUrl?: string;
  videoUrl?: string;
  videoBlob?: Blob;
  transcodeStatus: VideoTranscodeStatus;
}

export type StudyMaterialType = 'TEXTBOOK' | 'NOTES' | 'WORKSHEET';

export interface StudyMaterial extends SyncedEntity {
  title: string;
  type: StudyMaterialType;
  subject: string;
  grade: number;
  sizeBytes?: number;
  pages?: number;
  description: string;
  content?: string;
  downloadUrl?: string;
  offlineReady: boolean;
}

export interface QuestionOption {
  id: string;
  text: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface Question {
  id: string;
  quizId?: string;
  type: QuestionType;
  prompt: string;
  promptAudioUrl?: string;
  promptImageUrl?: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation?: string;
  level: number; // 1-5
  marks: number;
}

export interface Quiz extends SyncedEntity {
  lessonId: string;
  title: string;
  subject: string;
  grade: number;
  totalMarks: number;
  passingMarks: number;
  questions: Question[];
}

export interface QuizAnswer {
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  marksAwarded: number;
  timeSpentSec: number;
}

export interface QuizResult extends SyncedEntity {
  studentId: string;
  quizId: string;
  mode: AssessmentMode;
  answers: QuizAnswer[];
  score: number;
  maxScore: number;
  assessedLevel: number; // 1-5
  startedAt: string;
  submittedAt: string;
}

export interface AttendanceRecord extends SyncedEntity {
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string; // teacherId or user/device id
  source: AttendanceSource;
  note?: string;
}

export interface AtRiskFlag extends SyncedEntity {
  studentId: string;
  reason: string;
  ruleId: string;
  attendancePercent?: number;
  consecutiveAbsences?: number;
  suggestedSchemeIds?: string[];
  raisedAt: string;
  resolvedAt: string | null;
  resolvedBy: string | null;
  note?: string;
}

export interface SchemeRule {
  minGrade?: number;
  maxGrade?: number;
  minAge?: number;
  maxAge?: number;
  gender?: Gender | 'ALL';
  minAttendancePercent?: number;
  categories?: string[];
  isRural?: boolean;
}

export interface Scheme extends SyncedEntity {
  name: string;
  description: string;
  eligibilityRules: SchemeRule;
  requiredDocuments: string[];
  applicationSteps: string[];
  whereToApply: string;
  deadline?: string | null;
  girlSpecific: boolean;
  attendanceThreshold?: number; // e.g. 75%
  sourceUrl: string;
  lastVerifiedAt: string;
  translations?: Record<
    SupportedLanguage,
    {
      name: string;
      description: string;
      requiredDocuments: string[];
      applicationSteps: string[];
      whereToApply: string;
    }
  >;
}

export interface Facility {
  id: string;
  name: string;
  type: 'CSC_CENTER' | 'BLOCK_EDUCATION_OFFICE' | 'TALUKA_OFFICE' | 'POST_OFFICE' | 'GRAM_PANCHAYAT';
  address: string;
  contactNumber?: string;
  districtId: string;
  latitude?: number;
  longitude?: number;
}

export interface SchemeChecklistProgress extends SyncedEntity {
  studentId: string;
  schemeId: string;
  checkedDocs: string[]; // List of doc names ready
  completed: boolean;
  updatedAt: string;
}

export interface NotificationRecord extends SyncedEntity {
  recipientId: string;
  recipientName: string;
  recipientPhone?: string | null;
  type: 'ATTENDANCE_ALERT' | 'SCHEME_ELIGIBLE' | 'ASSESSMENT_REPORT' | 'ANNOUNCEMENT';
  title: string;
  message: string;
  channelsTried: NotificationChannel[];
  channelUsed: NotificationChannel | null;
  status: NotificationStatus;
  deliveredAt: string | null;
  metadata?: Record<string, unknown>;
}

export interface ChangeLogEntry {
  seq: number;
  entity: string;
  entityId: string;
  op: SyncOp;
  schoolId: string;
  deviceId: string;
  payload: Record<string, unknown>;
  hlc: string;
  receivedAt: string;
}

export interface ContentPackManifestItem {
  id: string;
  type: 'LESSON' | 'VIDEO' | 'QUIZ' | 'SCHEME';
  path: string;
  sha256: string;
  sizeBytes: number;
  version: number;
}

export interface ContentPack {
  version: number;
  generatedAt: string;
  totalSize: number;
  manifest: ContentPackManifestItem[];
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: string;
}

/**
 * RFC 7807 Problem Details
 */
export interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance?: string;
  invalidParams?: Array<{ name: string; reason: string }>;
  [key: string]: unknown;
}
