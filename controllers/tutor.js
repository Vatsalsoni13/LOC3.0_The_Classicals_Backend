const express = require("express");
const User = require("../models/User");
const Batch = require("../models/Batch");
const Assignment = require("../models/Assignment");
const { Mongoose } = require("mongoose");
const Pusher = require("pusher");
const Lecture = require("../models/Lecture");

const pusher = new Pusher({
  appId: "1182102",
  key: process.env.PUSHER_KEY,
  secret: process.env.SECRET,
  cluster: "ap2",
});

var ObjectID = require("mongodb").ObjectID;
exports.getSingleBatch = async (req, res) => {
  const { batchId } = req.query;
  try {
    let batch = await Batch.findById(batchId);
    let len = batch.students.length;
    let i;
    for (i = 0; i < len; i++) {
      let student = await User.findById(batch.students[i]);
      batch.students[i] = { name: student.name, email: student.email };
    }
    let owner = await User.findById(batch.userId);
    let own = {};
    own.name = owner.name;
    own.qualification = owner.qualification;
    own.phone = owner.phone;
    own.email = owner.email;
    own.location = owner.location;
    res.json({ batch: batch, owner: own });
  } catch (error) {
    res.json({ message: "BATCH NOT FOUND" });
  }
};

exports.createBatch = async (req, res) => {
  console.log(req.body);
  const { title, description, userId, subject, std } = req.body;
  // date format shd be yyyy/mm/dd
  //userId should be passed by front only so we should store it in async storage in app itself
  const info = {
    title: title,
    std: std,
    subject: subject,
    description: description,
    date_of_begin: new Date().toISOString(),
  };
  const batch = {
    userId: userId,
    info: info,
    students: [],
    assigned: [],
  };

  try {
    let user = await User.findById(userId);
    batch.info.tutor = user.name;
    let newBatch = Batch(batch);
    await newBatch.save();
    user.createdBatches.push({ batchId: newBatch._id.toString() });
    await user.save();
    res.json(newBatch);
  } catch (error) {
    res.json({ message: error });
  }
};

// exports.getDoubts = async (req, res) => {
//   const { tutorId } = req.query;
// };

exports.getMyBatches = async (req, res) => {
  const { tutorId } = req.query;
  try {
    let batches = await Batch.find({ userId: tutorId });
    res.json(batches);
  } catch (error) {
    res.json({ message: error });
  }
  // const { tutorId } = req.query;
  // try {
  //   let user = await User.findById(tutorId);
  //   let batches = user.createdBatches.map(async (batch) => {
  //     let cur = await Batch.findById(batch.batchId);
  //     return cur;
  //   });
  //   const allBatches = await Promise.all(batches);
  //   res.json(allBatches);
  // } catch (error) {
  //   console.log(error);
  // }
};

exports.extendDeadline = async (req, res) => {
  const { assignment_id, new_deadline } = req.body;
  try {
    let assignment = await Assignment.findById(assignment_id);
    assignment.deadline = new_deadline;
    await assignment.save();
    res.json("Deadline updated successfully");
  } catch (error) {
    res.json("Something went wrong");
  }
};
exports.getBatchLec = async (req, res) => {
  const { batchId } = req.query;
  try {
    let lectures = await Lecture.find({ batchId: batchId });
    let newLecs = lectures.map((item) => {
      let asign = {};
      asign.name = item.name;
      asign.link = item.link;
      asign.time = item.istDateTime;
      return asign;
    });
    res.json(newLecs);
  } catch (error) {
    res.json({ msg: error });
  }
};

exports.getBatchAssignments = async (req, res) => {
  const { batchId, student_id } = req.query;
  console.log(student_id);
  try {
    let assignments = await Assignment.find({ batchId: batchId });
    let newAssignments = assignments.map((item) => {
      let asign = {};
      asign.name = item.name;
      asign.completed = false;
      asign.marks = 0;
      let l = item.responses.length;
      for (let i = 0; i < l; i++) {
        if (item.responses[i].studentId === student_id) {
          asign.completed = true;
          asign.marks = item.responses[i].marks;
          break;
        }
      }
      asign.istDateTime = item.istDateTime;
      asign.path = item.path;
      asign.assignId = item._id;
      asign.deadline = item.deadline;
      asign.fileName = item.fileName;
      return asign;
    });
    res.json(newAssignments);
  } catch (error) {
    res.json({ message: error });
  }
};

exports.getAssignmentResponses = async (req, res) => {
  const { assignId, batchId } = req.query;
  try {
    let assignment = await Assignment.findById(assignId);
    let len = assignment.responses.length;
    let i;
    let submitted = new Map();
    for (i = 0; i < len; i++) {
      let student = await User.findById(assignment.responses[i].studentId);
      assignment.responses[i].email = student.email;
      assignment.responses[i].studentName = student.name;
      submitted.set(assignment.responses[i].studentId, 1);
    }
    let batch = await Batch.findById(batchId);
    console.log(batch);
    let notSubmitted = [];
    len = batch.students.length;
    for (i = 0; i < len; i++) {
      if (!submitted.has(batch.students[i])) {
        let student = await User.findById(batch.students[i]);
        console.log(student);
        notSubmitted.push({ email: student.email, studentName: student.name });
      }
    }
    let response = {};
    response.submitted = assignment.responses;
    response.notSubmitted = notSubmitted;
    res.json(response);
  } catch (error) {
    console.log(error);
    res.json({ message: error });
  }
};

exports.schedule = async (req, res) => {
  const { batchId } = req.query;
  // console.log(req.body);
  try {
    await Batch.findByIdAndUpdate(
      { _id: batchId },
      { $addToSet: { lectures: req.body } },
      { new: true, useFindAndModify: false },
      (err, detail) => {
        if (err) {
          return res.status(400).json({
            error: "Insert unsuccessful",
          });
        }
        res.json(detail);
      }
    );
  } catch (error) {
    console.log(error);
  }
};

exports.checkAttentive = (req, res) => {
  const { checkStr, classroomId } = req.query;
  res.json(checkStr);
  pusher.trigger(`${classroomId}`, "chatroom", {
    message: checkStr,
  });
  console.log(checkStr);
};

exports.giveFeedback = async (req, res) => {
  const { assignId, studentId } = req.query;
  const { marks } = req.body;
  try {
    let assignments = await Assignment.findById(assignId);
    console.log(assignments);
    let assignment = assignments.responses;
    console.log(assignment);
    let resp;
    for (let i = 0; i < assignment.length; i++) {
      if (assignment[i].studentId === studentId) {
        Assignment.findOneAndUpdate(
          { _id: assignId, "responses.studentId": studentId },
          {
            $set: { "responses.$.marks": marks },
          },
          { new: true },
          (err, detail) => {
            if (err) {
              return res.status(400).json({
                error: "Insert unsuccessful",
              });
            }
            console.log(detail);
            resp = detail;
            // res.json(detail);
          }
        );
        // obj = assignment[i];
        // obj.marks = marks;
        // indx = i;
        // found = true;
        break;
      }
    }
    // console.log(obj);
    // if (found)
    //   await Assignment.findByIdAndUpdate(
    //     { _id: assignId },
    //     { $set: { response: obj } },
    //     { new: true, useFindAndModify: false },
    //     (err, detail) => {
    //       if (err) {
    //         return res.status(400).json({
    //           error: "Insert unsuccessful",
    //         });
    //       }
    //       res.json(detail);
    //     }
    //   );
    // else {
    //   return res.status(400);
    // }
    res.json(resp);
  } catch (error) {
    console.log(error);
  }
};
