const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser")

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())
app.set('view engine', 'ejs')

function generateRandomString() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (var i = 6; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

const urlData = {
  "b2xVn2": {shortURL: "b2xVn2", longURL: "http://www.lighthouselabs.ca"},
  "9sm5xK": {shortURL: "9sm5xK", longURL: "http://www.google.com"}
};

const userData = { 
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

 // ----- all GET routes -----
app.get('/', (req, res) => {
  res.send('Hello!')
})

app.get('/urls.json', (req, res) => {
  res.json(urlData);
});

app.get('/users.json', (req, res) => {
  res.json(userData);
});

app.get('/register', (req, res) => {
  let templateVars = {}
  res.render('urls_register')
});

app.get('/login', (req, res) => {
  res.cookie('user_id', '')
  res.render('urls_login')
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new', templateVars);
});

app.get('/urls', (req, res) => {
  let templateVars = {urls: urlData, username: req.cookies['user_id']};
  res.render('urls_index', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars =  urlData[req.params.shortURL] = { shortURL: req.params.shortURL, longURL: urlData[req.params.shortURL].longURL }
    // username: req.cookies['username']
    res.render('urls_show', templateVars);
  });

//----- all POST routes------
  
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    const templateVars = { errCode: 400, errMsg: 'please, enter an email AND a  password'};
    res.status(400);
    res.render('error', templateVars);
    return;
  } else {
    for (let id in userData) {
      if (userData[id].email === req.body.email) {
        const temaplateVars = {
          errCode: 400,
          errMessage: 'email address has already been registered as a username, please try another address'
        }
          res.status(400);
          res.render('error', templateVars);
          return;
        }
    }
  }
  let uID = generateRandomString();
  userData[uID] = { id: uID,
                  email: req.body.email,
                  password: req.body.password
                };
  res.cookie('user_id', uID ); 
  res.redirect('/urls');
})

app.post('/login', (req, res) => {
  res.cookie('user_id', req.body.username);
  res.redirect('/urls')
});

app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

app.post('/urls', (req, res) => {
  app.post('/urls', (req, res) => {
    let shortURL = generateRandomString();
    let longURL = req.body.longURL
    urlDatabase[shortURL] = { shortURL, longURL }
    res.redirect('/urls'); 
  }) 
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlData[req.params.shortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});