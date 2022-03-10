const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
//const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const methodOverride = require('method-override');

const {getUserByEmail, generateRandomString, urlsForUser} = require("./helpers");

app.use(bodyParser.urlencoded({extended: true}));
//app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['admin'],
  maxAge: 24 * 60 * 60 * 1000
}));
app.use(methodOverride('_method'));
app.set("view engine", "ejs");

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
};

let urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
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
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { user:users[userID], urls: userUrls };

  res.render("urls_index", templateVars);
});


app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect(`/urls/${shortURL}`);
  }
});


app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    const templateVars = { user: users[req.session.user_id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  const templateVars = { user:users[userID], urls: userUrls, shortURL: shortURL, longURL: longURL };

  res.render("urls_show", templateVars);
});


//Redirect any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (shortURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("ShortURL entered doesn't exist");
  }
});


//updates a URL resource using Edit button
app.put("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(400).send("Invalid credentials");
  }

  urlDatabase[shortURL].longURL = req.body.updatedURL;
  res.redirect(`/urls`);
});


//removes a URL resource using Delete button
app.delete("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  
  if (userID !== urlDatabase[shortURL].userID) {
    return res.status(400).send("Invalid credentials");
  }

  delete urlDatabase[shortURL];
  res.redirect("/urls");
});


//// read registration page
app.get("/login", (req,res) => {
  const templateVars = { user:users[req.session.user_id] };
  res.render(`urls_login`, templateVars);
});


//create login function
app.post("/login", (req,res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const user = getUserByEmail(email, users);

  if (!email || !password) {
    return res.status(400).send("Invalid credentials");
  }

  if (!user) {
    return res.status(403).send("Email cannot be found");
  }


  if (!bcrypt.compareSync(password, user.password)) {
    return res.status(403).send("Password does not match");
  }

  req.session.user_id = user.id;
  res.redirect(`/urls`);
});


//create logout function
app.post("/logout", (req,res) => {
  req.session = null;
  res.redirect(`/urls`);
});


// read registration page
app.get("/register", (req,res) => {
  const templateVars = { user:users[req.session.user_id] };
  res.render(`urls_registration`, templateVars);
});


//create register function
app.post("/register", (req,res) => {
  if (!(req.body.email.trim()) || !(req.body.password.trim())) {
    res.status(400).send("Need to enter both email and password");
  } else if (getUserByEmail(req.body.email.trim(), users)) {
    res.status(400).send("Email already existed, please sign in");
  } else {
    const userID = generateRandomString();
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    users[userID] = {
      id: userID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.user_id = userID;
    res.redirect(`/urls`);
  }
});