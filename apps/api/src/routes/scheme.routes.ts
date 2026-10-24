import { Router } from 'express';
import { schemeController } from '../controllers/scheme.controller.js';
import { authenticate, optionalAuthenticate } from '../middleware/auth.js';

export const schemeRouter = Router();

schemeRouter.get('/schemes', optionalAuthenticate, schemeController.listSchemes);
schemeRouter.get('/schemes/:id', optionalAuthenticate, schemeController.getSchemeById);
schemeRouter.get('/schemes/:schemeId/eligibility/:studentId', optionalAuthenticate, schemeController.checkEligibility);
schemeRouter.get('/schemes/:schemeId/checklist/:studentId', optionalAuthenticate, schemeController.getChecklist);
schemeRouter.put('/schemes/checklist', optionalAuthenticate, schemeController.updateChecklist);
schemeRouter.get('/facilities', optionalAuthenticate, schemeController.listFacilities);
