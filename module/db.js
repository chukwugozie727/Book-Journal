
const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Render requires SSL
  },
});

db.connect()
  .then(() => console.log("✅ Connected to PostgreSQL Render DB"))
  .catch((err) => console.error("❌ DB connection error:", err.message));

module.exports = db;
