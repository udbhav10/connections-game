const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.use(express.static(path.join(__dirname, 'client/dist')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get('/api/todays-words', async (req, res) => {
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
      });
  
      const query = `SELECT * FROM connections WHERE date = CURRENT_DATE;`;
      const result = await pool.query(query);
      await pool.end();
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching today’s records:', error);
      res.status(500).send('Server Error');
    }
  });

