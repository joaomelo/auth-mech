const path = require('path');

const express = require('express');
const app = express();
const port = 3000;

const dirs = {
  static: path.join(__dirname, 'static'),
  views: path.join(__dirname, 'views')
};

app.set('view engine', 'pug');
app.set('views', dirs.views);

app.use('/static', express.static(dirs.static));

app.get('/', (req, res) => res.render('home'));

app.get('/auth', (req, res) => {
  const type = req.query.type || 'signup';
  const service = req.query.service || 'firebase';

  return res.render('auth', { type, service });
});

app.get('/protected', (req, res) => res.send('Protected'));

app.listen(port, () => console.log(`demo app listening at http://localhost:${port}`));
