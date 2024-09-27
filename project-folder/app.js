const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;
const session = require('express-session');
const path = require('path');

let events = [];

// Sample user role (in a real app, this would come from authentication)
let userRole = 'teacher'; // Change to 'teacher' to test teacher functionality

// Middleware
app.set('view engine', 'ejs');
app.use(bodyParser.json());
app.use(express.static('public'));

// Initialize session
app.use(session({
  secret: 'your-secret-key', // Change this to a secure key
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Set up body-parser to handle form submissions
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));

// Function to read user data from JSON file
function readUsersFromFile() {
  const data = fs.readFileSync('users.json');
  return JSON.parse(data);
}

// Function to write updated user data to JSON file
function writeUsersToFile(users) {
  fs.writeFileSync('users.json', JSON.stringify(users, null, 2));
}

// Route for the index page
app.get('/', (req, res) => res.render('index')); // Renders the index page

// Route for the login page
app.get('/login', (req, res) => res.render('login'));

// Route for the events page
app.get('/events', (req, res) => res.render('events', { events, userRole })); // Separate events page route

// Route for the signup page
app.get('/signup', (req, res) => res.render('signup'));

// Handle signup POST request
app.post('/signup', (req, res) => {
  const { username, password, role } = req.body;
  const users = readUsersFromFile();

  // Check if the username already exists
  const existingUser = users.find(u => u.username === username);

  if (existingUser) {
    res.send('<h1>Username already exists. Please <a href="/signup">try a different one</a>.</h1>');
  } else {
    // Add new user to the JSON data
    users.push({ username, password, role });
    writeUsersToFile(users);
    res.send('<h1>Signup successful! Please <a href="/login">login here</a>.</h1>');
  }
});

// Handle login POST request
app.post('/login', (req, res) => {
  const { username, password, role } = req.body;
  const users = readUsersFromFile();
  
  // Find the matching user in the JSON data
  const user = users.find(u => u.username === username && u.password === password && u.role === role);

  if (user) {
    req.session.user = user;
    // Redirect based on role
    if (role === 'admin') {
      res.redirect('/admin/dashboard');
    } else if (role === 'teacher') {
      res.redirect('/teacher/dashboard');
    } else if (role === 'student') {
      res.redirect('/student/dashboard');
    }
  } else {
    // Invalid login
    res.send('<h1>Invalid username, password, or role selected. Please <a href="/login">try again</a>.</h1>');
  }
});

// Dashboard routes for each role
app.get('/admin/dashboard', (req, res) => res.render('admin'));
app.get('/teacher/dashboard', (req, res) => res.render('teacher'));
app.get('/student/dashboard', (req, res) => res.render('student'));

// Student Dashboard Route
app.get('/student', (req, res) => {
  if (req.session.user && req.session.user.role === 'student') {
    res.render('student', { events: events }); // Render student.ejs
  } else {
    res.redirect('/'); // Redirect to home if not authenticated
  }
});

// Event Management Routes for Teachers
app.post('/api/events', (req, res) => {
  if (req.session.user && req.session.user.role !== 'teacher') return res.status(403).send('Forbidden');
  const { eventName, eventDateTime, eventLocation, eventDescription } = req.body;
  events.push({ id: events.length + 1, eventName, eventDateTime, eventLocation, eventDescription });
  res.status(201).json({ message: 'Event created' });
});

app.delete('/api/events/:id', (req, res) => {
  if (req.session.user && req.session.user.role !== 'teacher') return res.status(403).send('Forbidden');
  events = events.filter(event => event.id !== parseInt(req.params.id));
  res.status(204).send();
});

// Handle logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.redirect('/');
    }
    res.redirect('/'); // Redirect to home page after logout
  });
});



app.get('/events', (req, res) => {
  res.render('events', { events, userRole: req.session.user.role });
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


