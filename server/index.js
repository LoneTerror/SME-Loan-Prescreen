const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const app = express();

// --- 1. UPDATE PORT (Use Pterodactyl Env Var or fallback to 5010) ---
const port = process.env.PORT || 5010; 

// --- 2. UPDATE CORS (Allow your frontend domain) ---
app.use(cors({
  origin: ['https://spot-check.site', 'https://www.spot-check.site'], // Allow Prod & Dev
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use(express.json());

// --- DATABASE CONNECTION ---
const db = new sqlite3.Database('./applications.db', (err) => {
  if (err) console.error(err.message);
  console.log('✅ Connected to SQLite database.');
});

/**
 * DATABASE INITIALIZATION
 * This block runs once when the server starts.
 * 1. Creates the 'applications' table if it doesn't exist.
 * 2. Checks if the table is empty.
 * 3. Seeds the table with "Legacy" data (historical records) if empty.
 */
db.serialize(() => {
  // Define Schema
  db.run(`CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    refId TEXT UNIQUE,
    companyName TEXT,
    turnover INTEGER,
    amountRequested INTEGER,
    yearsTrading INTEGER,
    loanType TEXT,
    sector TEXT,
    status TEXT,
    date TEXT,
    files TEXT,
    source TEXT,         
    doc_income TEXT,
    doc_kyc TEXT,
    doc_business TEXT
  )`);

  // Check for existing data
  db.get("SELECT count(*) as count FROM applications", [], (err, row) => {
    if (row.count === 0) {
      console.log("🌱 Seeding database with Legacy CSV Data...");
      
      // Mock Data derived from CSV requirements
      const csvData = [
        { id: "SMEServ1", ind: "Services", amt: 1000000, inc: "Yes", kyc: "Yes", biz: "Yes" },
        { id: "SMETrad2", ind: "Trading", amt: 4500000, inc: "No", kyc: "No", biz: "No" },
        { id: "SMETrad3", ind: "Trading", amt: 3100000, inc: "No", kyc: "Yes", biz: "No" },
        { id: "SMEServ4", ind: "Services", amt: 100000, inc: "Yes", kyc: "Yes", biz: "No" },
        { id: "SMEServ5", ind: "Services", amt: 1800000, inc: "Yes", kyc: "Yes", biz: "Yes" },
        { id: "SMEServ6", ind: "Services", amt: 1000000, inc: "No", kyc: "Yes", biz: "No" },
        { id: "SMEServ7", ind: "Services", amt: 2400000, inc: "No", kyc: "Yes", biz: "Yes" },
        { id: "SMEServ8", ind: "Services", amt: 400000, inc: "Yes", kyc: "No", biz: "Yes" },
        { id: "SMEServ9", ind: "Services", amt: 4600000, inc: "Yes", kyc: "Yes", biz: "Yes" },
        { id: "SMEManu10", ind: "Manufacturing", amt: 3700000, inc: "Yes", kyc: "No", biz: "Yes" },
        { id: "SMEManu11", ind: "Manufacturing", amt: 2100000, inc: "Yes", kyc: "No", biz: "Yes" },
        { id: "SMETrad12", ind: "Trading", amt: 900000, inc: "No", kyc: "Yes", biz: "Yes" },
        { id: "SMETrad13", ind: "Trading", amt: 2300000, inc: "Yes", kyc: "Yes", biz: "No" },
        { id: "SMEServ14", ind: "Services", amt: 4400000, inc: "Yes", kyc: "Yes", biz: "Yes" },
        { id: "SMEServ15", ind: "Services", amt: 4500000, inc: "Yes", kyc: "Yes", biz: "No" },
        { id: "SMETrad16", ind: "Trading", amt: 1300000, inc: "No", kyc: "Yes", biz: "Yes" },
        { id: "SMETrad17", ind: "Trading", amt: 600000, inc: "No", kyc: "Yes", biz: "Yes" },
        { id: "SMEManu18", ind: "Manufacturing", amt: 5000000, inc: "Yes", kyc: "Yes", biz: "Yes" },
        { id: "SMEServ19", ind: "Services", amt: 1300000, inc: "No", kyc: "No", biz: "Yes" },
        { id: "SMEManu20", ind: "Manufacturing", amt: 300000, inc: "Yes", kyc: "Yes", biz: "No" }
      ];

      const stmt = db.prepare(`INSERT INTO applications (
        refId, companyName, amountRequested, sector, status, date, source, doc_income, doc_kyc, doc_business, turnover, yearsTrading, loanType, files
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

      csvData.forEach(item => {
        stmt.run(
          item.id,
          `Legacy Applicant ${item.id}`, 
          item.amt,
          item.ind,
          "Archived",
          "2023-01-01",
          "Legacy", // Flag to identify CSV imports vs Web submissions
          item.inc,
          item.kyc,
          item.biz,
          0, // Placeholder
          0, // Placeholder
          "General SME", 
          "[]"
        );
      });
      stmt.finalize();
      console.log("✅ Seeded 20 Legacy Records from CSV.");
    }
  });
});

/**
 * API: SUBMIT APPLICATION
 * Endpoint: POST /api/submit
 * Handles new loan applications from the web wizard.
 * Generates a RefID and saves all applicant metadata.
 */
app.post('/api/submit', (req, res) => {
  const { applicant, files, loanType } = req.body;
  const refId = "APP-" + Math.floor(1000 + Math.random() * 9000);
  const status = "Under Review";
  const date = new Date().toISOString().split('T')[0];

  const sql = `INSERT INTO applications (
    refId, companyName, turnover, amountRequested, yearsTrading, loanType, sector, status, date, files, source
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  const params = [
    refId, 
    applicant.companyName, 
    applicant.turnover, 
    applicant.amountRequested, 
    applicant.yearsTrading, 
    loanType || "Working Capital", 
    applicant.sector, 
    status, 
    date, 
    JSON.stringify(files),
    "Web" // Mark source as Web Submission
  ];

  db.run(sql, params, function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ success: true, refId: refId });
  });
});

/**
 * API: GET ALL APPLICATIONS
 * Endpoint: GET /api/applications
 * Returns all records (both Web and Legacy) sorted by newest first.
 * Used by both User Dashboard and Admin Dashboard.
 */
app.get('/api/applications', (req, res) => {
  db.all("SELECT * FROM applications ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ data: rows });
  });
});

/**
 * API: UPDATE STATUS
 * Endpoint: POST /api/status
 * Updates the workflow status (Approved/Rejected/Revoked) for a specific RefID.
 * Used by Admin Dashboard (Approve/Reject) and User Dashboard (Revoke).
 */
app.post('/api/status', (req, res) => {
  const { refId, status } = req.body;
  db.run(`UPDATE applications SET status = ? WHERE refId = ?`, [status, refId], function(err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ success: true });
  });
});

app.listen(port, () => {
  console.log(`🏦 Server running on http://localhost:${port}`);
});