const express = require('express');
const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getAllPaginatedExams,
  getPaginatedDraftedExams,
  getPaginatedScheduledExams,
  getPaginatedPastExams,
  getPaginatedLiveExams,
  scheduleExam,
  markPastExam,
  markLiveExam,
  getExamsForUser,
  getExamStatus,
  getExamForTeachers,
  createExamForTeachers
} = require('../controllers/examController');
const { authorizeRoles } = require('../middlewares/roleAuthMiddleware');

const router = express.Router();

// Rate Limit
const {limiter} = require("../utils/rateLimitUtils");
// router.use(limiter);


router.get('/', getAllPaginatedExams); // Pagination
router.get('/drafts',authorizeRoles, getPaginatedDraftedExams)
router.get('/scheduled', getPaginatedScheduledExams);
router.get('/past', getPaginatedPastExams);
router.get('/live', getPaginatedLiveExams);
router.get('/find/:exam_id', getExamById);
router.get('/student',getExamsForUser)
router.get("/teacher",getExamForTeachers)

router.post('/', authorizeRoles, createExam);
router.post("/create/teacher",authorizeRoles, createExamForTeachers)


router.put('/:exam_id', authorizeRoles, updateExam);
router.put('/publish/:exam_id',authorizeRoles, scheduleExam); // to publish an exam
router.put('/past-exam/:exam_id',authorizeRoles, markPastExam); // to mark an exam as past
router.put('/live-exam/:exam_id',authorizeRoles, markLiveExam); // to mark an exam as past

router.delete('/:exam_id',authorizeRoles, deleteExam);
router.get("/status/:exam_id", getExamStatus);

module.exports = router;