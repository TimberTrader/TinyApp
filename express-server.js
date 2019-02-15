const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));

app.set('view engine', 'ejs')

function generateRandomString() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (var i = 6; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
  return result;
}

var urlDatabase = {
  "b2xVn2": {shortURL: "b2xVn2", longURL: "www.lighthouselabs.ca"},
  "9sm5xK": {shortURL: "9sm5xK", longURL: "http://www.google.com"}
};

app.get('/', (req, res) => {
  res.send('Hello!')
})

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

app.get('/urls', (req, res) => {
    let templateVars = {urls: urlDatabase};
    res.render('urls_index', templateVars);
    console.log(urlDatabase)
});

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString();
  let longURL = req.body.longURL
  urlDatabase[shortURL] = { shortURL, longURL }
  res.redirect('/urls'); 
});

app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls/');
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});