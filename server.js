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
  callbackURL: `${process.env['REDIRECT_URI']}/oauth2/redirect/google`,
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

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

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
    const query = `
      SELECT * FROM connections
      WHERE date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE;
    `;
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

app.get('/get-progress', async(req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {

    const query = `
      SELECT data, attempts, result_flag, date 
      FROM user_data 
      WHERE user_id = $1
      AND date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE
    `;
    const { rows } = await pool.query(query, [userId]);
    const userData = rows[0];

    if (userData) {
      return res.json({
        progressData: userData.data,
        attempts: userData.attempts,
        result_flag: userData.result_flag
      });
    }

    res.json({});
  } catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({ error: 'Server error' });
  }

})

app.post('/save-progress', async (req, res) => {
  const userId = req.user?.id;
  const progressData = req.body.progressData || null;
  const resultFlag = req.body.resultFlag === true ? 1 : req.body.resultFlag === false ? 0 : null;
  const attempts = req.body.attempts || null;

  if (!userId) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    // Check if an entry already exists for this user_id
    const existingEntry = await pool.query(
      `SELECT id FROM user_data WHERE user_id = $1 AND date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE`,
      [userId]
    );

    if (existingEntry.rows.length > 0) {
      // Update the existing entry
      const query = `
        UPDATE user_data
        SET data = $1, result_flag = $2, attempts = $3
        WHERE user_id = $4
        AND date = (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE
      `;
      await pool.query(query, [progressData, resultFlag, attempts, userId]);
    } else {
      // Insert a new entry
      const query = `
        INSERT INTO user_data (user_id, data, result_flag, attempts, date)
        VALUES ($1, $2, $3, $4, (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Kolkata')::DATE)
      `;
      await pool.query(query, [userId, progressData, resultFlag, attempts]);
    }

    res.status(200).json({ message: 'Progress data saved successfully' });
  } catch (error) {
    console.error('Error saving progress data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

process.on('SIGINT', async () => {
  await pool.end();
  console.log('Pool has ended');
  process.exit(0);
});