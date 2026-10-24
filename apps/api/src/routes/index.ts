import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { studentRouter } from './student.routes.js';
import { attendanceRouter } from './attendance.routes.js';
import { contentRouter } from './content.routes.js';
import { assessmentRouter } from './assessment.routes.js';
import { schemeRouter } from './scheme.routes.js';
import { syncRouter } from './sync.routes.js';
import { notificationRouter } from './notification.routes.js';
import { districtRouter } from './district.routes.js';

export const apiV1Router = Router();

apiV1Router.use('/auth', authRouter);
apiV1Router.use('/students', studentRouter);
apiV1Router.use('/attendance', attendanceRouter);
apiV1Router.use('/content', contentRouter);
apiV1Router.use('/assessment', assessmentRouter);
apiV1Router.use('/schemes', schemeRouter);
apiV1Router.use('/sync', syncRouter);
apiV1Router.use('/notifications', notificationRouter);
apiV1Router.use('/district', districtRouter);
