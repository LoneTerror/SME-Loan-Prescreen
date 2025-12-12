🏦 SpotCheck - SME Loan Prescreening PlatformSpotCheck is a comprehensive, full-stack web application designed to streamline the loan application process for Small and Medium Enterprises (SMEs). It features a dual-interface system for Loan Applicants to submit requests and Bank Administrators to manage the underwriting queue.✨ 



# ✨ Key Features


👤 Applicant Portal
- Smart Eligibility Wizard: Automated validation of turnover, business age, and restricted sectors before submission.
- Legacy Opportunities: Searchable database of historical loan offers.One-Click 
    Apply: Instantly apply for legacy offers using your verified profile.
    Smart Matching: Automatically checks turnover against loan amounts.
- Document Management: Categorized uploads for KYC, Income, and Business proofs with simulated AI verification and preview.
- SpotBot AI: Integrated chatbot for instant FAQs regarding eligibility and documents.
- PDF Reports: Downloadable rejection reports explaining specific eligibility failures.



🛡️ Bank Staff / Admin Dashboard
- Visual Analytics: Interactive charts (Pie & Bar) visualizing application status distribution and loan demand by sector.
- Queue Management: Review, Approve, or Reject applications in real-time.
- Live Metrics: KPI cards showing total queue volume, pending actions, and total pipeline value.


🛠️ Tech Stack
- Frontend (Client)
- Framework: React (Vite)
- Styling: Tailwind CSS
- Icons: Lucide 
- ReactCharts: Recharts
- PDF Generation: js
- PDFHTTP Client: Axios


Backend (Server)
- Runtime: Node.js
- Framework: Express.js
- Database: SQLite3 (Zero-configuration, file-based)
- CORS: Configured for production and development environments.




# 🚀 Getting Started


Follow these steps to set up the project locally.
Note: The Repository is configured for production as the app is deployed and hosted at: https://spot-check.site and the routes point to production domains. You can directly visit this website for testing the prototype application.


If you want to clone this repository and test the prototype application in local machine then it is mandatory to change the routes in two files to run it on local development (otherwise it'll still fetch the production routes, ignoring local development routes entirely).

The modification steps are listed below:

- Find `Configuration Section` at file `/src/App.jsx`

- Find `Configuration Section` at file `/src/components/Dashboard.jsx`

Comment out the `PRODUCTION URL` & Comment in the `DEVELOPMENT URL` on both files mentioned in (a & b) above


1. Clone the Repository

Bash
```
git clone https://github.com/LoneTerror/SME-Loan-Prescreen.git
cd SME-Loan-Prescreen
```


2. Setup Backend
- The backend runs on Port 3000 (or 5010 in production config). 
- It will automatically seed the database with legacy data on the first run.


Bash
```
cd server
npm install
node index.js
```

You should see: `✅ Connected to SQLite database.` and `🏦 Server running...`


3. Setup FrontendOpen a new terminal window. The frontend usually runs on Port `5173`.


Bash
```
cd client
npm install
npm run dev
```




# 🔑 Demo Credentials

Use the following credentials to access the different portals:


Role -> Applicant

Username -> `user`

Password -> `password`

Features -> Submit loans, Upload docs, View History

---------------------------------------------------------------------

Role -> Bank Admin 

Username -> `admin`

Password -> `admin123`

Features -> View Charts, Approve/Reject Apps



# ⚙️ Configuration

Eligibility Rules
You can modify the eligibility criteria in `client/src/rules.json`:

- Minimum Turnover
- Max Turnover (SME Ceiling)
- Restricted Sectors
- Document Requirements

Database
- The application uses SQLite.The database file is created at `server/applications.db`.
To reset the data, simply delete this file and restart the server; it will re-seed automatically.



# 🚢 Deployment

The project is configured for deployment environments like Pterodactyl or VPS.

- Nginx: Reverse proxy configuration is required to route traffic to the Frontend (React) and Backend (Node).
- API URL: Update `API_URL` in `client/src/App.jsx` and `Dashboard.jsx` to point to production backend domain.

Startup: A `startup.sh` script is recommended to run both services concurrently in a single container.


# Access The Website Here:

URL: https://spot-check.site
