// 필요한 모듈들을 불러옵니다.
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const posts = require('./posts');

// 서버가 4000번 포트에서 듣기를 시작합니다. 서버가 시작되면 콘솔에 메시지를 출력합니다.
const port = 4000;
const secretKey = 'difficultnodejs';
const TopSecretKey = 'difficultnodejs';
const refreshTokens = [];
const app = express();
app.use(express.json());
// 이거 추가하니까 된당. 아마도 라이브서버는 5500에서 열리고 서버는 4000에서 열어서 오류가 났나보다
app.use(cors());

app.post('/login', (req, res) => {
  const username = req.body.username;
  const user = { name: username };
  const accessToken = jwt.sign(user, secretKey, { expiresIn: '20s' });
  const refreshToken = jwt.sign(user, TopSecretKey, { expiresIn: '1d' });
  refreshTokens.push(refreshToken);
  res.cookie('jwt', refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ accessToken: accessToken });
});

app.get('/posts', authMiddleware, (req, res) => {
  res.json(posts);
});

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get('/refresh', (req, res) => {
  const cookies = req.cookies;
  if (!cookies) return res.sendStatus(401);
  const refreshToken = cookies.jwt;
  if (!refreshToken.includes(refreshToken)) {
    return res.sendStatus(403);
  }
  jwt.verify(refreshToken, TopSecretKey, (err, user) => {
    if (err) return res.sendStatus(403);
  });
  const accessToken = jwt.sign({ name: username }, secretKey, {
    expiresIn: '30s',
  });
  res.json(accessToken);
});

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
