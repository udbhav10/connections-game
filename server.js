const express = require('express');
const cors = require('cors');
const path = require('path');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oidc');
const { Pool } = require('pg');
const session = require('express-session');
const PGStore = require('connect-pg-simple')(session);
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: ['profile']
}, async function verify(issuer, profile, cb) {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM federated_credentials WHERE provider = $1 AND subject = $2',
      [issuer, profile.id]
    );

    if (rows.length === 0) {
      const result = await pool.query(
        'INSERT INTO users (name) VALUES ($1) RETURNING id',
        [profile.displayName]
      );

      const id = result.rows[0].id;

      await pool.query(
        'INSERT INTO federated_credentials (user_id, provider, subject) VALUES ($1, $2, $3)',
        [id, issuer, profile.id]
      );

      const user = {
        id: id,
        name: profile.displayName
      };
      return cb(null, user);
    } else {
      // User exists
      const userResult = await pool.query(
        'SELECT * FROM users WHERE id = $1',
        [rows[0].user_id]
      );

      if (userResult.rows.length === 0) {
        return cb(null, false);
      }
      return cb(null, userResult.rows[0]);
    }
  } catch (err) {
    return cb(err);
  }
}));

app.use(cors());

app.use(express.static(path.join(__dirname, 'client/dist/client/browser')));

app.use(session({
  store: new PGStore({
    pool: pool,
    tableName: 'session'
  }),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use(passport.authenticate('session'));

passport.serializeUser(function(user, cb) {
  process.nextTick(function() {
    cb(null, { id: user.id, username: user.username, name: user.name });
  });
});

passport.deserializeUser(function(user, cb) {
  process.nextTick(function() {
    return cb(null, user);
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/client/browser/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/api/todays-words', async (req, res) => {
    try {  
      const query = `SELECT * FROM connections WHERE date = CURRENT_DATE;`;
      const result = await pool.query(query);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching today’s records:', error);
      res.status(500).send('Server Error');
    }
  });

  app.get('/login-status', (req, res) => {
    const isLoggedIn = req.isAuthenticated();
    res.json({ isLoggedIn });
  });  

  app.get('/login/federated/google', passport.authenticate('google'));

  app.get('/oauth2/redirect/google', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/'
  }));

  app.post('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.json({ message: 'Logout successful' });
    });
  });

  process.on('SIGINT', async () => {
    await pool.end();
    console.log('Pool has ended');
    process.exit(0);
  });