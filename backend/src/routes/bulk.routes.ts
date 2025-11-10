import { Router } from 'express';
import multer from 'multer';
import { bulkUploadProducts } from '../controllers/bulkController';
import { generateProductReport } from '../controllers/reportController';
import { authenticate } from '../middleware/auth';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.post('/upload', authenticate, upload.single('file'), bulkUploadProducts);
router.get('/report', authenticate, generateProductReport);

export default router;
