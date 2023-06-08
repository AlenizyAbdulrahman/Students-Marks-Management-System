let express = require('express')
let app = express.Router()
let teachersDocument = require('../models/Teachers/teachersSchema')
let coursesDocument = require('../models/courses/coursesSchema');
const studentsDocuments = require('../models/Students/studentsSchema');

const requireLogin = (req, res, next) => {
  if (req.session.isLoggedIn) {
    // User is logged in, call next middleware function
    next();
  } else {
    // User is not logged in, redirect to login page
    res.redirect('/teacher');
  }
};

const alreadyLoggedIn = (req, res, next) => {
  if (req.session.isLoggedIn) {
    // User is already logged in, redirect to home page
    res.redirect('/teacher/home');
  } else {
    // User is not logged in, call next middleware function
    next();
  }
};


app.get('/',alreadyLoggedIn,(req,res) => {
    const error = req.flash('error')[0];
    res.render('./Teachers/loginDoctor',{error}) 
})

// Handle POST requests to /login
app.post('/', async (req, res) => {

  //   const teacher = new teachersDocument
    const { email, password } = req.body;
  
    try {
      const user = await teachersDocument.findOne({ Email:email, password:password });
      if (!user) {
        req.flash('error', 'Please enter a valid username and password.');
        res.redirect('/teacher')
        return;
      }
  
      req.session.userId = user._id;
      req.session.isLoggedIn = true;
      res.redirect('/teacher/home');
    } catch (err) {
      console.error(err);
      res.sendStatus(500);
    }
  });




app.get('/logout', (req, res) => {
  // Destroy the session and redirect to the login page
  req.session.destroy(err => {
    if (err) {
      console.log(err);
    }
    res.redirect('/');
  });
});

app.get('/home',requireLogin,(req,res) => {
  res.render('./Teachers/DHomePage') 
})








app.get('/personal',requireLogin, async (req,res) => {
  const personalData = await teachersDocument.findOne({_id:req.session.userId}).select({teacherName:1, teacherId:1, Email:1, mobileNumber:1, _id:1})
  res.render('./Teachers/Dinfo', {teacherData: personalData})
})

app.post('/personal',requireLogin, async (req,res) => {

  mobileNumber = req.body.mobile
  teacherName = req.body.teacherName
 let result =  await teachersDocument.findOneAndUpdate({_id: req.session.userId}, {mobileNumber:mobileNumber,teacherName:teacherName},{new: true})
  res.redirect('/teacher/home')
})

app.get("/courses",requireLogin, async(req,res) => {
  const error = req.flash('error')[0];
  const personalData = await teachersDocument.findOne({_id:req.session.userId}).select({courses:1})    
  res.render('./Teachers/corsDoc',{teacherData: personalData, error: error})
})

app.get("/courses/show/:courseId",requireLogin, async(req,res) => {
  const students = await studentsDocuments.find({"courses.courseID":req.params.courseId},{ 'courses.$': 1 }).select({studentName:1,studentId:1})
    // console.log(students)
    res.render("./Teachers/showCourseInfo",{students: students, courseId:req.params.courseId})
})

app.get("/courses/show/addMark/:id/:courseId",requireLogin, async(req,res) => {
  const students = await studentsDocuments.findOne({_id:req.params.id, 'courses.courseID': req.params.courseId  },{ 'courses.$': 1 }).select({studentName:1,studentId:1})
    res.render("./Teachers/addStudentMark",{students: students, courseId:req.params.courseId})
})

app.post("/courses/show/addMark/:id/:courseId",requireLogin, async(req,res) => {
  
  let total= parseInt(req.body.Quiz1)+parseInt(req.body.Quiz2)+parseInt(req.body.midTerm1)+parseInt(req.body.midTerm2)+parseInt(req.body.project)+parseInt(req.body.final)
  
  const students = await studentsDocuments.updateOne({ _id:req.params.id, 'courses.courseID': req.params.courseId  }, {
    $set: {
      'courses.$.Quiz1': req.body.Quiz1,
      'courses.$.Quiz2': req.body.Quiz2,
      'courses.$.midTerm1': req.body.midTerm1,
      'courses.$.midTerm2': req.body.midTerm2,
      'courses.$.project': req.body.project,
      'courses.$.final': req.body.final,
      'courses.$.total': total,
    }
  })
  res.redirect(`/teacher/courses/show/${req.params.courseId}`)
    // .then(result => {
    //   console.log(`${result.nModified} record(s) updated`);
    // })
    // .catch(error => {
    //   console.log(`Error updating student: ${error}`);
    // });
})


app.delete("/courses/:courseId",requireLogin, async(req,res) => {
  const personalData = await teachersDocument.findOneAndUpdate({_id:req.session.userId},{$pull: {courses: {courseID:req.params.courseId}}}, {new: true} )  
  .then(() => {
    res.status(200).json('deleted')
  }).catch(() => {
    res.status(404).json('There was an error .event was not deleted')
  })
})


app.get("/addCourse",requireLogin, async(req,res) => {
  const error = req.flash('error')[0];
  const personalData = await coursesDocument.find({})
  res.render('./Teachers/listCorsD',{coursesData: personalData, error: error})
})

app.post("/addCourse/:id/:name/:hour",requireLogin, async(req,res) => {

  try {
  const personalData = await teachersDocument.updateOne(
    { _id: req.session.userId, 'courses.courseID': { $ne: req.params.id } },
    { $addToSet: { courses: { courseID: req.params.id, courseName: req.params.name, hour:req.params.hour } } })

  if (personalData.modifiedCount === 1) {

    res.redirect('/teacher/courses');

  } else {
    req.flash('error', "This coures is already added");
    res.redirect('/teacher/addCourse');
  }
  
}catch (error) {
  
  req.flash('error', "This coures is already added");
  res.redirect('/teacher/addCourse');
}
 })
 
module.exports = app
 
