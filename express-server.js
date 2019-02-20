const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
/* const cookieParser = require("cookie-parser");
was unable to test this above due to errors
arising from the install of 'bcrypt@2.0.0' */
var cookieSession = require('cookie-session')


app.use(bodyParser.urlencoded({extended: true}));
// app.use(cookieParser());
app.set('view engine', 'ejs')
app.use(cookieSession({
  name: 'session',
  keys: ['wrbjshdsy4145216'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

//------ helper functions ------
function generateRandomString() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (var i = 6; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
};

function urlsForUser(uID) {
  let userUrls = {};
  for (let url in urlData) {
    // let shortUrl = urlData[url].shortURL;
    if (urlData[url].id === uID)
      userUrls[url] = urlData[url];
  }
  return userUrls;
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
app.get('/u/:shortURL', (req, res) => {
  let site = urlData[req.params.shortURL].longURL
  res.redirect(site);
})

app.get('/urls.json', (req, res) => {
  res.json(urlData);
});

app.get('/users.json', (req, res) => {
  res.json(userData);
});

//----- register new user ------
app.get('/register', (req, res) => {
  let templateVars = {
    user: userData[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  }
  res.render('urls_register', templateVars);
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
  // let hashPwd = bcrypt.hashSync(req.body.password, 10);
  /* was unable to test this above due to errors
  arising from the install of 'bcrypt@2.0.0' */
  let uID = generateRandomString();
    userData[uID] = { id: uID,
    email: req.body.email,
    password: req.body.password
  };
  req.session.user_id = uID; 
  res.redirect('/urls');
 };
});

//----- allow user to login -----
app.get('/login', (req, res) => {
  let templateVars = {
    user: userData[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  }
  res.render('urls_login', templateVars )
});

app.post('/login', (req, res) => {
  let userMatch = null
  for (let id in userData) {
    if ((userData[id].email === req.body.email) && (userData[id].password === req.body.password)) {
      /* bcrypt.compareSync(req.body.password, userData[id].password) should replace
      (userData[id].password === req.body.password) in the above conditional ____
      was unable to test this above due to errors arising from the install of 'bcrypt@2.0.0' */
      userMatch = true;
      req.session.user_id = userData[id].id;
      res.redirect('/urls');
    }
  }

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
  if (req.session.user_id) {
    let templateVars = {
      user: userData[req.session.user_id],
      urls: urlsForUser(req.session.user_id)
    };
  res.render('urls_index', templateVars);
 } else {
   res.redirect('/login');
 }
});

//----- delete url entry from main page ----
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id) {
  delete urlData[req.params.shortURL];
  let templateVars = {
    user: userData[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  };
  res.render('urls_index', templateVars);
  } else {
  res.redirect('/login');
  }
});

//----- edit url entry from main page ----
app.get('/urls/:shortName', (req, res) => {
  if (req.session.user_id) {
      let templateVars = {
        user: userData[req.session.user_id],
        urls: urlData[req.params.shortName]
      };
      res.render('urls_show', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.post('/urls/:shortURL/edit', (req, res) => {
  if (req.session.user_id) {
    urlData[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

//----- create new shortURL from long URL -----
app.get('/new', (req, res) => {
  for (let id in userData) {
    if (req.session.user_id) {
      let templateVars = {
        user: userData[req.session.user_id],
        urls: urlsForUser(req.session.user_id)
      };
      res.render('urls_new', templateVars);
    } else {
      res.redirect('/login');
    }
  }
});

app.post('/urls', (req, res) => {
  if (req.session.user_id) {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL;
    let id = req.session['user_id']
    urlData[shortURL] = {
      shortURL: shortURL,
      longURL: longURL,
      id: id
      };
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

// ---- display longURL from shortURL -----
app.get('/urls/:shortURL', (req, res) => {
  let templateVars = {
    user: userData[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  };
  res.render('urls_show', templateVars);
});


//------ allow user to logout -----
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

// ----- boots web server ------
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});