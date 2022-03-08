const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

const generateRandomString = function() {
  let result = '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  while (result.length < 6) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
};

// check if email entered already existed in the database
const checkEmailExists = function(email, usersDatabase) {
  for (const user in usersDatabase) {
    if (usersDatabase[user].email === email) {
      return usersDatabase[user];
    }
  }
  return undefined;
};

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});


app.get("/urls", (req, res) => {
  const templateVars = { user:users[req.cookies['user_id']],urls: urlDatabase };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  const templateVars = { user:users[req.cookies['user_id']] };
  res.render("urls_new", templateVars);
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  const templateVars = { user:users[req.cookies['user_id']], shortURL: shortURL, longURL: longURL };
  res.render("urls_show", templateVars);
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  res.redirect(`/urls/${shortURL}`);
});


//Redirect any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  if(shortURL) {
    res.redirect(`${longURL}`);
  } else {
    res.status(404).send("ShortURL entered doesn't exist");
  }
});


//updates a URL resource using Edit button
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls`);
});


//removes a URL resource using Delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});


//// read registration page
app.get("/login", (req,res) => {
  const templateVars = { user:users[req.cookies['user_id']] };
  res.render(`urls_login`, templateVars);
});


//create login function
app.post("/login", (req,res) => {
  const user = checkEmailExists(req.body.email, users);
  if (user && (req.body.password === user.password)) {
    res.cookie('user_id',user.id);
    res.redirect(`/urls`);
  } else if (!user) {
    res.status(403).send("Email cannot be found");
  } else if (req.body.password !== user.password) {
    res.status(403).send("Password does not match");
  }
});


//create logout function
app.post("/logout", (req,res) => {
  res.clearCookie('user_id');
  res.redirect(`/urls`);
});


// read registration page
app.get("/register", (req,res) => {
  const templateVars = { user:users[req.cookies['user_id']] };
  res.render(`urls_registration`, templateVars);
});


//create register function
app.post("/register", (req,res) => {
  if (!(req.body.email) || !(req.body.password)) {
    res.status(400).send("Need to enter both email and password");
  } else if (checkEmailExists(req.body.email, users)) {
    res.status(400).send("Email already existed, please sign in");
  } else {
    const userID = generateRandomString();
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    res.cookie("user_id", userID);
    res.redirect(`/urls`);
  }
});