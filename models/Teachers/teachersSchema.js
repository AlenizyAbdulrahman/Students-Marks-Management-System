const mongoose = require('mongoose');

const teachersSchema = new mongoose.Schema({
  teacherName: {type: String, required: true},
  teacherId: {type: Number, unique: true, required: true },
  Email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  mobileNumber: Number,
  courses: [{
    courseID: {type: String },
    courseName: {type: String},
    hour: {type: String},
  }]
});


const teachersDocuments = mongoose.model('Teachers', teachersSchema)

module.exports = teachersDocuments