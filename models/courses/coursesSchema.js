const mongoose = require('mongoose');

const coursesSchema = new mongoose.Schema({
  courseName: {type: String},
  courseId: {type: String},
  HOURS: {type: String},
  DOCTOR: {type: String},
});



const coursesDocument = mongoose.model('courses',coursesSchema)

module.exports = coursesDocument