const express = require("express");
const User = require("../models/User");
const router = express.Router();
const userController = require("../controllers/user");
const tutorController = require("../controllers/tutor");
const scheduleController = require("../controllers/scheduler");
// const multer = require('multer');
// const storage = multer.diskStorage({
//     destination:(req,file,cb)=>{
//         cb(null,'assignments/')
//     },
//     filename:(req,file,cb)=>{
//         cb(null,req.body.name+file.originalname)
//     }
// })
// const upload = multer({storage:storage})

router.get("/mybatches", tutorController.getMyBatches);
router.post("/create_batch", tutorController.createBatch);
router.post("/extend-deadline", tutorController.extendDeadline);
router.post("/schedule", scheduleController.scheduleAssignment);
router.post("/schedule-lec", scheduleController.scheduleLec);
router.get("/assignments", tutorController.getBatchAssignments);
router.get("/responses", tutorController.getAssignmentResponses);
router.get("/attentive", tutorController.checkAttentive);
router.get("/lectures", tutorController.getBatchLec);
router.post("/giveFeedback", tutorController.giveFeedback);
// router.put("/schedule", tutorController.schedule);
module.exports = router;
