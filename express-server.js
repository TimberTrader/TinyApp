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

const urlDatabase = {
  "b2xVn2": {shortURL: "b2xVn2", longURL: "http://www.lighthouselabs.ca"},
  "9sm5xK": {shortURL: "9sm5xK", longURL: "http://www.google.com"}
};

app.get('/', (req, res) => {
  res.send('Hello!')
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  let templateVars = {username: req.cookies['username']};
  res.render('urls_new', templateVars);
});

app.get('/urls', (req, res) => {
    let templateVars = {urls: urlDatabase, username: req.cookies['username']};
    res.render('urls_index', templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  let templateVars =
    { shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      username: req.cookies["username"]};
  res.render('urls_show', templateVars);
});

app.post('/login', function(req, res){
  res.cookie('username', req.body.username);
  res.redirect('/urls')
});

app.post('/logout', (req, res) => {
  // req.session = null;
  // app.locals.email = '';
  res.clearCookie('username');
  res.redirect('/urls');
});


app.post('/urls', (req, res) => {
  let shortUR = generateRandomString();
  let longURL = req.body.longURL
  urlDatabase[shortURL] = { shortURL, longURL }
  res.redirect('/urls'); 
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});