let express = require('express')
let app = express.Router()
let studentsDocument = require('../models/Students/studentsSchema')
let coursesDocument = require('../models/courses/coursesSchema')
const bcrypt = require('bcrypt');

const requireLogin = (req, res, next) => {
    if (req.session.isLoggedIn) {
      // User is logged in, call next middleware function
      next();
    } else {
      // User is not logged in, redirect to login page
      res.redirect('/student');
    }
  };

const alreadyLoggedIn = (req, res, next) => {
    if (req.session.isLoggedIn) {
      // User is already logged in, redirect to home page
      res.redirect(`/student/home`);
    } else {
      // User is not logged in, call next middleware function
      next();
    }
};
  
app.get('/',alreadyLoggedIn,(req,res) => {
    const error = req.flash('error')[0];
    res.render('./Students/loginStudent', { error })
})

// Handle POST requests to /login
app.post('/', async (req, res) => {

        const { email, password } = req.body;
        try {
          const user = await studentsDocument.findOne({ Email:email });
          if (!user) {
                req.flash('error', 'Please enter a valid username and password.');
                res.redirect('/student');
            return;
          }
      
          const result = await bcrypt.compare(password, user.password);
          if (!result) {
                req.flash('error', 'Please enter a valid username and password.');
                res.redirect('/student');
            return;
          }
      
          req.session.userId = user._id;
          req.session.isLoggedIn = true;
          res.redirect(`/student/home`);
        } catch (err) {
          req.flash('error', err);
          res.redirect('/student');
        }
});



app.get('/register',(req,res) => {
    const error = req.flash('error')[0];
    res.render('./Students/RegStudent', {error})
})

// Handle POST requests to /register
app.post('/register', async (req, res) => {

    const { name,studentId , email, password } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const addStd = new studentsDocument({ studentName:name, studentId:studentId, Email: email, password: hashedPassword })
      addStd.save().then(() => {
        res.redirect('/student');
      }).catch((err) => {
        req.flash('error', 'Cant use data already exist!');
        res.redirect('/student/register');
      })
      
    } catch (err) {
      req.flash('error', err);
      res.redirect('/student/register');
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
    res.render('./Students/SHomePage',{userid: req.session.userId, userName: req.session.userName})
})


  app.get('/personal',requireLogin, async (req,res) => {
    const personalData = await studentsDocument.findOne({_id:req.session.userId}).select({studentName:1, studentId:1, Email:1, mobileNumber:1, _id:1})
    res.render('./Students/sInfo', {studentData: personalData})
  })

  app.post('/personal',requireLogin, async (req,res) => {

    mobileNumber = req.body.mobile
    studentName = req.body.studentName
   let result =  await studentsDocument.findOneAndUpdate({_id: req.session.userId}, {mobileNumber:mobileNumber,studentName:studentName},{new: true})
    res.redirect('/student/home')
  })

  app.get("/courses",requireLogin, async(req,res) => {
    const error = req.flash('error')[0];
    const personalData = await studentsDocument.findOne({_id:req.session.userId}).select({courses:1})    
    res.render('./Students/stuCors',{studentData: personalData, error: error})
  })

  app.get("/courses/show/:courseId",requireLogin, async(req,res) => {
    const students = await studentsDocument.findOne({_id:req.session.userId, 'courses.courseID': req.params.courseId  },{ 'courses.$': 1 })
    // console.log(students)
      // console.log(req.params.courseId)
      res.render("./Students/showCourseMark",{students: students})
  })


  app.delete("/courses/:courseId",requireLogin, async(req,res) => {
    // console.log(req.params.courseId)
    const personalData = await studentsDocument.findOneAndUpdate({_id:req.session.userId},{$pull: {courses: {courseID:req.params.courseId}}}, {new: true} )  
    .then(() => {
      res.status(200).json('deleted')
    }).catch(() => {
      res.status(404).json('There was an error .event was not deleted')
    })
  })


  app.get("/addCourse",requireLogin, async(req,res) => {
    const error = req.flash('error')[0];
    const personalData = await coursesDocument.find({})
    res.render('./Students/listCorsS',{coursesData: personalData, error: error})
  })

  app.post("/addCourse/:id/:name/:hour",requireLogin, async(req,res) => {

    try {
    const personalData = await studentsDocument.updateOne(
      { _id: req.session.userId, 'courses.courseID': { $ne: req.params.id } },
      { $addToSet: { courses: { courseID: req.params.id, courseName: req.params.name, hour:req.params.hour } } })

    if (personalData.modifiedCount === 1) {

      res.redirect('/student/courses');

    } else {
      req.flash('error', "This coures is already added");
      res.redirect('/student/addCourse');
    }
    
  }catch (error) {
    
    req.flash('error', "This coures is already added");
    res.redirect('/student/addCourse');
  }
   })
  

// find({"courses.courseID":"CS240"},{studentName:1,studentId:1,_id:1})

module.exports = app