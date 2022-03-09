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
const findUserByEmail = function(email, users) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
};


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

let users = { 
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
}

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

const urlsForUser = function(id) {
  let Urls = {};
  for (const shortURL in urlDatabase) {
    if(urlDatabase[shortURL].userID === id) {
      Urls[shortURL] = urlDatabase[shortURL];
    }
  }
  return Urls;
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
  const userID = req.cookies['user_id'];
  const userUrls = urlsForUser(userID);
  const templateVars = { user:users[userID], urls: userUrls };

  res.render("urls_index", templateVars); 
});


app.post("/urls", (req, res) => {
  if(req.cookies['user_id']) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.cookies['user_id']
    };
    res.redirect(`/urls/${shortURL}`);
  };
});


app.get("/urls/new", (req, res) => {
  if(req.cookies['user_id']) {
    const templateVars = { user: users[req.cookies['user_id']] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  const userID = req.cookies['user_id'];
  const userUrls = urlsForUser(userID);
  const templateVars = { user:users[userID], urls: userUrls, shortURL: shortURL, longURL: longURL };
  console.log(templateVars)
  res.render("urls_show", templateVars);
});


//Redirect any request to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if(shortURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("ShortURL entered doesn't exist");
  }
});


//updates a URL resource using Edit button
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL
  longURL = req.body.updatedURL;
  res.redirect(`/urls`);
});


//removes a URL resource using Delete button
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  delete longURL;
  res.redirect("/urls");
});


//// read registration page
app.get("/login", (req,res) => {
  const templateVars = { user:users[req.cookies['user_id']] };
  res.render(`urls_login`, templateVars);
});


//create login function
app.post("/login", (req,res) => {
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const user = findUserByEmail(email, users);

  if (!email || !password) {
    return res.status(400).send("Invalid credentials");
  }

  if (!user) {
    return res.status(403).send("Email cannot be found");
  }

  if (user.password !== req.body.password) {
    return res.status(403).send("Password does not match");
  }

  res.cookie('user_id', user.id);
  res.redirect(`/urls`);
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
  if (!(req.body.email.trim()) || !(req.body.password.trim())) {
    res.status(400).send("Need to enter both email and password");
  } else if (findUserByEmail(req.body.email.trim(), users)) {
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