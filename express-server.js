const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs')

//------ helper functions ------
function generateRandomString() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (var i = 6; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
};

function urlsForUser(uID) {
  let usersUrls = {};
  for (let url in urlData) {
    let shortUrl = urlData[url].shortURL;
    if (urlData[url].id === uID)
      usersUrls[shortUrl] = urlData[url];
  }
  return {urls: usersUrls};
};

//------ user and url database (linked by user_id) -----
const urlData = {
  "b2xVn2": {
    shortURL: "b2xVn2",
    longURL: "http://www.lighthouselabs.ca",
    id: "user_id"
    },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.google.com",
    id: "user_id"
  }
};

const userData = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "funk"
  }
};

 // ----- misc. GET routes -----
app.get('/', (req, res) => {
  res.send('Hello!')
})

app.get('/urls.json', (req, res) => {
  res.json(urlData);
});

app.get('/users.json', (req, res) => {
  res.json(userData);
});

//----- register new user ------
app.get('/register', (req, res) => {
  res.render('urls_register');
});

app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    const templateVars = {
      errCode: 400,
      errMsg: 'please, enter an email AND a password'
    };
    res.status(400);
    res.render('error', templateVars);
    return;
  } else  {
    for (let id in userData) {
      if (userData[id].email === req.body.email) {
      const templateVars = {
      errCode: 400,
      errMsg: 'email address has been found, please try another address'
    };
    res.status(400);
    res.render('error', templateVars);
    return;
    }
  };

  let uID = generateRandomString();
    userData[uID] = { id: uID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', uID ); 
  res.redirect('/urls');
 };
});

//----- allow user to login -----
app.get('/login', (req, res) => {
  res.cookie('user_id', '')
  res.render('urls_login')
});

app.post('/login', (req, res) => {
  let userMatch = null
  for (let id in userData) {
    if ((userData[id].email === req.body.email) && (userData[id].password === req.body.password)) {
      userMatch = true;
      res.cookie('user_id', userData[id]);
      console.log(userMatch)
      // res.redirect('/urls');
    }
  }
  console.log(userMatch)

  if (userMatch) {
    res.redirect('/urls');
    return;
  } else {
    const templateVars = {
      errCode: 403,
      errMsg: 'email address cannot be found, please try another address'
    };
    res.status(403);
    res.render('error', templateVars);
    return;
  }
});

//---- main page showing all urls created ------
app.get('/urls', (req, res) => {
  if (res.cookie) {
  res.render('urls_index', urlsForUser(req.cookies.user_id.id));
 } else {
   res.redirect('/login');
 }
});

//----- delete url entry from main page ----
app.post('/urls/:shortURL/delete', (req, res) => {
  if (res.cookie) {
  delete urlData[req.params.shortURL];
  res.render('urls_index', urlsForUser(req.cookies.user_id.id));
  } else {
  res.redirect('/login');
  }
});

//----- edit url entry from main page ----
app.post('/urls/:shortURL/edit', (req, res) => {
  if (res.cookie) {
   urlData[req.params.shortURL];
  res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//----- create new shortURL from long URL -----
app.get('/new', (req, res) => {
  for (let id in userData) {
    if (res.cookie) {
      res.render('urls_new');
    } else {
      res.redirect('/login');
    }
  }
});

app.post('/urls', (req, res) => {
  if (res.cookie) {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    let id = req.cookies['user_id'].id
    urlData[shortURL] = { shortURL, longURL, id }
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// ---- display longURL from shortURL -----
app.get('/urls/:shortURL', (req, res) => {
  let templateVars =  urlData[req.params.shortURL] = { shortURL: req.params.shortURL, longURL: urlData[req.params.shortURL].longURL }
  res.render('urls_show', templateVars);
});


//------ allow user to logout -----
app.post('/logout', (req, res) => {
  res.redirect('/urls');
  res.clearCookie('user_id');
});

// ----- boots web server ------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});