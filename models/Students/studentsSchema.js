const mongoose = require('mongoose');

const studentsSchema = new mongoose.Schema({
  studentName: {type: String, required: true},
  studentId: {type: Number, required: true, unique: true },
  Email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  mobileNumber: Number,
  courses: [{
    courseID: {type: String },
    courseName: {type: String},
    hour: {type: String},
    Quiz1: {type: Number},
    Quiz2: {type: Number},
    midTerm1: {type: Number},
    midTerm2: {type: Number},
    project: {type: Number},
    final: {type: Number},
    total: {type: Number},
  }]
});
// const studentsSchema = new mongoose.Schema({
//   studentName: {type: String, required: true},
//   studentId: {type: Number, required: true, unique: true },
//   Email: {type: String, required: true, unique: true},
//   password: {type: String, required: true},
//   mobileNumber: Number,
//   courses: [{
//     courseID: {type: String},
//     courseName: {type: String},
//     Quiz1: {type: Number},
//     Quiz2: {type: Number},
//     midTerm1: {type: Number},
//     midTerm2: {type: Number},
//     project: {type: Number},
//     final: {type: Number},
//   }]
// });


const studentsDocuments = mongoose.model('Students',studentsSchema)

module.exports = studentsDocuments