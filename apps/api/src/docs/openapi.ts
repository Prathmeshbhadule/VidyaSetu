import { Request, Response } from 'express';

export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Vidya Setu API',
    version: '1.0.0',
    description: 'Production-grade, offline-first learning platform for rural schools in India.',
  },
  servers: [
    { url: '/api/v1', description: 'Current Cloud API v1' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      deviceAuth: {
        type: 'apiKey',
        in: 'header',
        name: 'X-Device-Token',
      },
    },
  },
  paths: {
    '/auth/login': {
      post: {
        summary: 'User login (email/password with argon2id)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object', properties: { identifier: { type: 'string' }, password: { type: 'string' } }, required: ['identifier', 'password'] } } },
        },
        responses: { 200: { description: 'Authenticated successfully' } },
      },
    },
    '/sync/push': {
      post: {
        summary: 'Push batch of client mutations (idempotent, max 200)',
        security: [{ bearerAuth: [] }, { deviceAuth: [] }],
        responses: { 200: { description: 'Sync push response' } },
      },
    },
    '/sync/pull': {
      get: {
        summary: 'Pull delta changes since sequence cursor',
        security: [{ bearerAuth: [] }, { deviceAuth: [] }],
        responses: { 200: { description: 'Sync pull change feed' } },
      },
    },
    '/students': {
      get: {
        summary: 'List students by school or grade',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Student list' } },
      },
    },
    '/attendance/grid': {
      get: {
        summary: '7-day attendance grid for classroom',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Attendance grid' } },
      },
    },
    '/content/lessons': {
      get: {
        summary: 'Browse published lessons by subject and grade',
        responses: { 200: { description: 'Lesson list' } },
      },
    },
    '/schemes/schemes': {
      get: {
        summary: 'Browse government welfare schemes with eligibility rules',
        responses: { 200: { description: 'Scheme list' } },
      },
    },
    '/district/dashboard': {
      get: {
        summary: 'District administrator aggregated analytics dashboard',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Dashboard metrics' } },
      },
    },
  },
};

export function renderDocs(req: Request, res: Response): void {
  const html = `<!DOCTYPE html>
<html>
<head>
  <title>Vidya Setu API Documentation</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
</head>
<body style="margin: 0; background: #fafafa;">
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.ui = SwaggerUIBundle({
      spec: ${JSON.stringify(openApiSpec)},
      dom_id: '#swagger-ui',
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ]
    });
  </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.send(html);
}
