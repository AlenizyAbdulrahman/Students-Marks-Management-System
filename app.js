const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const students = require('./routes/studentsRoute')
const teachers = require('./routes/teachersRoute')
const app = express();

const port = 3000;

mongoose.connect('mongodb://127.0.0.1:27017/web-project', { useNewUrlParser: true, useUnifiedTopology: true });

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(flash());
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

app.use('/student', students)
app.use('/teacher', teachers)

app.get('/',(req,res) => {
  res.render('./main')
})
app.use(express.static(__dirname + '/public'));
// // Render the login page
// app.get('/login', (req, res) => {
//   res.send(`

//   `);
// });



// // Render the registration page
// app.get('/register', (req, res) => {
//   res.send(`

//   `);
// });

// // Handle POST requests to /register
// app.post('/register', async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const user = new User({ name, email, password: hashedPassword });
//     await user.save();
//     console.log(`Inserted document with _id: ${user._id}`);
//     res.redirect('/login');
//   } catch (err) {
//     console.error(err);
//     res.sendStatus(500);
//   }
// });

// // Render the dashboard page
// app.get('/dashboard', async (req, res) => {
//   try {
//     const user = await User.findById(req.session.userId);
//     if (!user) {
//       res.redirect('/login');
//       return;
//     }

//     res.send(`
//       <h1>Welcome, ${user.name}!</h1>
//       <a href="/logout">Logout</a>
//     `);
//   } catch (err) {
//     console.error(err);
//     res.sendStatus(500);
//   }
// });

// // Handle GET requests to /logout
// app.get('/logout', (req, res) => {
//   req.session.destroy();
//   res.redirect('/login');
// });

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`);
});