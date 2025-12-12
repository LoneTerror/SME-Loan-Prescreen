import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle, Upload, ArrowRight, ShieldCheck, AlertTriangle, 
  FileText, Loader2, Lock, Info, RefreshCw, Save, LogOut, 
  Download, Plus, Clock, FileCheck, XCircle, Briefcase, TrendingUp, Truck,
  Filter, ArrowUpDown, Search, Zap, FileUp, Trash2, Eye, X,
  UserCheck, Banknote, AlertCircle
} from 'lucide-react';
import { jsPDF } from "jspdf"; 
import rules from './rules.json'; 
import Dashboard from './components/Dashboard'; 
import Login from './components/Login'; 
import SpotBot from './components/SpotBot'; 
import logo from './assets/logo.png';

// --- CONFIGURATION ---
// DEVELOPMENT URL (For Local Testing)
// const API_URL = 'http://localhost:3000'; 

// PRODUCTION URL (Keep active for deployment)
const API_URL = 'https://backend.spot-check.site';

// --- CONSTANTS ---
const REQUIRED_DOCS_STRUCTURE = [
  {
    category: "KYC Documents",
    icon: <UserCheck className="w-5 h-5 text-indigo-600" />,
    items: [
      { id: 'kyc_biz_pan', label: 'Business PAN Card', required: true },
      { id: 'kyc_own_pan', label: "Owner's PAN Card", required: true },
      { id: 'kyc_own_aadhar', label: "Owner's Aadhar", required: true },
      { id: 'kyc_office_proof', label: 'Office Address Proof', required: true }
    ]
  },
  {
    category: "Income Proof",
    icon: <Banknote className="w-5 h-5 text-green-600" />,
    items: [
      { id: 'inc_pnl', label: 'P&L Statement (3 Years)', required: true },
      { id: 'inc_balance', label: 'Balance Sheet (3 Years)', required: true },
      { id: 'inc_itr', label: 'ITR Acknowledgement (3 Years)', required: true },
      { id: 'inc_bank', label: 'Bank Statement (6-12 Months)', required: true }
    ]
  },
  {
    category: "Business Proof",
    icon: <Briefcase className="w-5 h-5 text-blue-600" />,
    items: [
      { id: 'biz_reg', label: 'Business Registration Cert', required: true },
      { id: 'biz_cin', label: 'Corporate Identity Number (CIN)', required: false }, 
      { id: 'biz_directors', label: 'List of Directors', required: false }
    ]
  }
];

const Navbar = ({ userRole, onLogout, onHome }) => (
  <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 shadow-lg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onHome}>
          <img src={logo} alt="SpotCheck" className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl text-slate-100 tracking-tight">SpotCheck</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-bold text-slate-200">{userRole === 'admin' ? 'Bank Administrator' : 'Applicant'}</span>
            <span className="text-xs text-slate-400">Logged In</span>
          </div>
          <button onClick={onLogout} className="bg-slate-700 border border-slate-600 hover:bg-red-900/40 text-slate-300 hover:text-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const DocPreviewModal = ({ isOpen, docName, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 z-[70] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl h-[80vh] rounded-xl overflow-hidden flex flex-col">
        <div className="bg-slate-100 p-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="font-bold text-slate-700 flex items-center gap-2"><FileText className="w-5 h-5"/> {docName}</h3>
          <button onClick={onClose} className="hover:bg-slate-200 p-2 rounded-full"><X className="w-5 h-5 text-slate-500"/></button>
        </div>
        <div className="flex-1 bg-slate-50 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="w-24 h-32 bg-white border-2 border-slate-200 shadow-sm mx-auto flex items-center justify-center">
              <span className="text-xs text-slate-300">PREVIEW</span>
            </div>
            <p className="text-slate-500 text-sm">This is a simulated preview of your uploaded file.</p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3 h-3"/> AI Scan Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ActionModal = ({ isOpen, type, data, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
        <div className="p-6 text-center">
          {type === 'locked' && <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="w-8 h-8"/></div>}
          {type === 'revoke' && <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle className="w-8 h-8"/></div>}
          {type === 'processing' && <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><Loader2 className="w-8 h-8 animate-spin"/></div>}
          {type === 'success' && <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-8 h-8"/></div>}

          <h3 className="text-xl font-bold text-slate-900 mb-2">
            {type === 'locked' && "Action Locked"}
            {type === 'revoke' && "Revoke Application?"}
            {type === 'processing' && "Processing..."}
            {type === 'success' && "Success!"}
          </h3>

          <div className="text-slate-500 text-sm px-4">
            {type === 'locked' && "You must submit a regular application first to verify your profile."}
            {type === 'revoke' && <p>Are you sure you want to withdraw application <strong>{data?.refId}</strong>?</p>}
            {type === 'processing' && "Please wait while we update our records..."}
            {type === 'success' && <p>The operation completed successfully.</p>}
          </div>
        </div>
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-3 justify-end">
          {type === 'locked' && <button onClick={onClose} className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl">Understood</button>}
          {type === 'revoke' && <><button onClick={onClose} className="flex-1 bg-white border border-slate-300 font-bold py-3 rounded-xl">Cancel</button><button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl">Yes, Revoke</button></>}
          {type === 'success' && <button onClick={onClose} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl">Continue</button>}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => localStorage.getItem('sc_user_role') || null);
  const [applicantView, setApplicantView] = useState('dashboard');
  const [myApps, setMyApps] = useState([]);   
  const [legacyApps, setLegacyApps] = useState([]); 
  const [latestProfile, setLatestProfile] = useState(null); 
  const [selectedLegacyApp, setSelectedLegacyApp] = useState(null);
  
  const [modalState, setModalState] = useState({ isOpen: false, type: 'locked', data: null });
  const [previewDoc, setPreviewDoc] = useState(null);
  const [legacyFilter, setLegacyFilter] = useState('All'); 
  const [legacySort, setLegacySort] = useState('None');
  const [step, setStep] = useState(1);
  const [loanType, setLoanType] = useState("Working Capital");
  const [formData, setFormData] = useState({ companyName: '', turnover: '', amountRequested: '', yearsTrading: '', sector: 'Retail', entityType: 'Sole Trader' });
  const [error, setError] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState({}); 
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);
  const [smeCategory, setSmeCategory] = useState(null);

  const fetchAllData = () => {
    if (currentUser === 'user') {
      axios.get(`${API_URL}/api/applications`)
        .then(res => {
          const allData = res.data.data;
          const webApps = allData.filter(app => app.source === 'Web');
          setMyApps(webApps);
          if (webApps.length > 0) setLatestProfile(webApps[0]); 
          setLegacyApps(allData.filter(app => app.source === 'Legacy'));
        })
        .catch(err => console.error("Error fetching apps", err));
    }
  };

  useEffect(() => { if (applicantView === 'dashboard') fetchAllData(); }, [applicantView, currentUser]);

  const handleLogin = (role) => { setCurrentUser(role); localStorage.setItem('sc_user_role', role); };
  const handleLogout = () => { setCurrentUser(null); localStorage.removeItem('sc_user_role'); setApplicantView('dashboard'); };
  
  const startNewApplication = (type) => {
    setLoanType(type);
    setFormData(latestProfile ? {
        companyName: latestProfile.companyName, turnover: latestProfile.turnover, yearsTrading: latestProfile.yearsTrading, sector: latestProfile.sector, entityType: "Sole Trader", amountRequested: '' 
    } : { companyName: '', turnover: '', amountRequested: '', yearsTrading: '', sector: 'Retail', entityType: 'Sole Trader' });
    setStep(1); setUploadedFiles({}); setApplicantView('wizard'); setSmeCategory(null);
  };

  const preventNegative = (e) => {
    if (e.key === '-' || e.key === 'e' || e.key === '+') e.preventDefault();
  };

  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
  };

  const downloadRejectionReport = () => {
    const doc = new jsPDF();
    doc.text(`Rejection Report for ${formData.companyName}`, 20, 20);
    doc.text(`Reason: ${error}`, 20, 40);
    doc.save("Rejection_Report.pdf");
  };

  const checkLegacyEligibility = (item) => {
    if (!latestProfile) return "NA"; 
    const userTurnover = parseInt(latestProfile.turnover) || 0;
    const itemAmount = parseInt(item.amountRequested) || 0;
    return userTurnover >= itemAmount ? "Eligible" : "Ineligible";
  };

  const getFilteredLegacyData = () => {
    let data = [...legacyApps];
    if (legacyFilter === 'Eligible') data = data.filter(item => checkLegacyEligibility(item) === 'Eligible');
    else if (legacyFilter === 'Ineligible') data = data.filter(item => checkLegacyEligibility(item) === 'Ineligible');

    if (legacySort === 'EligibleFirst') data.sort((a, b) => {
      const statA = checkLegacyEligibility(a); const statB = checkLegacyEligibility(b);
      return (statA === statB) ? 0 : (statA === 'Eligible' ? -1 : 1);
    });
    else if (legacySort === 'IneligibleFirst') data.sort((a, b) => {
      const statA = checkLegacyEligibility(a); const statB = checkLegacyEligibility(b);
      return (statA === statB) ? 0 : (statA === 'Ineligible' ? -1 : 1);
    });
    return data;
  };
  const filteredLegacyData = getFilteredLegacyData();

  const handleApplyNow = (legacyItem) => {
    if (!latestProfile) { setModalState({ isOpen: true, type: 'locked', data: null }); return; }
    setSelectedLegacyApp(legacyItem); setUploadedFiles({}); setApplicantView('legacy-upload'); 
  };

  const handleRevokeClick = (app) => { setModalState({ isOpen: true, type: 'revoke', data: app }); };

  const executeRevoke = async () => {
    setModalState(prev => ({ ...prev, type: 'processing' }));
    try {
      await axios.post(`${API_URL}/api/status`, { refId: modalState.data.refId, status: 'Revoked' });
      await new Promise(resolve => setTimeout(resolve, 800));
      fetchAllData();
      setModalState(prev => ({ ...prev, type: 'success' }));
    } catch (err) { alert("Failed to revoke."); closeModal(); }
  };

  const closeModal = () => { setModalState({ isOpen: false, type: 'locked', data: null }); };

  const handleFileUpload = (docId) => {
    setUploadedFiles(prev => ({ ...prev, [docId]: { status: 'scanning', fileName: 'uploading...' } }));
    setTimeout(() => {
      setUploadedFiles(prev => ({ ...prev, [docId]: { status: 'analyzing', fileName: 'analyzing...' } }));
      setTimeout(() => { setUploadedFiles(prev => ({ ...prev, [docId]: { status: 'verified', fileName: `${docId}_verified.pdf` } })); }, 1200);
    }, 1000);
  };

  const REQUIRED_DOC_IDS = REQUIRED_DOCS_STRUCTURE.flatMap(section => section.items).filter(doc => doc.required).map(doc => doc.id);
  const isAllDocsComplete = REQUIRED_DOC_IDS.every(id => uploadedFiles[id]?.status === 'verified');

  const handleWizardSubmit = async () => {
    if (!isAllDocsComplete) return;
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API_URL}/api/submit`, { applicant: formData, files: Object.keys(uploadedFiles), loanType: loanType, timestamp: new Date().toISOString() });
      setSubmissionResult(response.data); setApplicantView('success');
    } catch (err) { alert("Connection Error"); } finally { setIsSubmitting(false); }
  };

  const handleLegacySubmit = async () => {
      if (!isAllDocsComplete || !selectedLegacyApp || !latestProfile) return;
      setIsSubmitting(true);
      const payload = {
        applicant: { companyName: latestProfile.companyName, turnover: latestProfile.turnover, yearsTrading: latestProfile.yearsTrading, sector: latestProfile.sector, entityType: "Sole Trader", amountRequested: selectedLegacyApp.amountRequested },
        files: Object.keys(uploadedFiles), loanType: `Legacy Opportunity (${selectedLegacyApp.sector} Match)`, timestamp: new Date().toISOString()
      };
      try {
          const response = await axios.post(`${API_URL}/api/submit`, payload);
          setSubmissionResult(response.data); setApplicantView('success');
      } catch (err) { alert("Connection Error"); } finally { setIsSubmitting(false); }
  };

  const handleCheckEligibility = () => {
    setError(null);
    setSmeCategory(null);
    if (!formData.companyName.trim()) { setError("Company Name is required."); return; }
    if (!formData.turnover || formData.turnover <= 0) { setError("Turnover must be a positive number."); return; }
    if (!formData.amountRequested || formData.amountRequested <= 0) { setError("Loan Amount must be a positive number."); return; }
    if (!formData.yearsTrading || formData.yearsTrading < 0) { setError("Years Trading cannot be negative."); return; }

    const turnover = parseInt(formData.turnover);
    const years = parseInt(formData.yearsTrading);
    const amount = parseInt(formData.amountRequested);

    if (turnover < rules.eligibility.min_turnover) { setError(`Turnover of ${formatCurrency(turnover)} is below the minimum requirement.`); return; }
    if (turnover > rules.eligibility.max_turnover) { setError(`Turnover exceeds ₹500 Cr. You are classified as a Large Enterprise.`); return; }
    if (years < rules.eligibility.min_years_trading) { setError(`Business age (${years} years) is below the minimum requirement.`); return; }
    if (amount > turnover) { setError(`Loan amount cannot exceed annual turnover.`); return; } 
    if (rules.eligibility.banned_sectors.includes(formData.sector)) { setError(`The '${formData.sector}' sector is restricted.`); return; }
    
    if (turnover <= 100000000) setSmeCategory("Micro Enterprise");
    else if (turnover <= 1000000000) setSmeCategory("Small Enterprise");
    else setSmeCategory("Medium Enterprise");

    setStep(2);
  };

  if (!currentUser) return <Login onLogin={handleLogin} />;
  if (currentUser === 'admin') return <Dashboard onBack={handleLogout} />;

  const renderUploadSection = () => (
    <div className="space-y-8 animate-in slide-in-from-right duration-500">
      {REQUIRED_DOCS_STRUCTURE.map((section, idx) => (
        <div key={idx} className="space-y-4">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 p-2 border-b border-slate-200">
            {section.icon} 
            {section.category}
          </h3>
          <div className="grid grid-cols-1 gap-3">
            {section.items.map((doc) => {
              const fileState = uploadedFiles[doc.id] || {};
              return (
                <div key={doc.id} className={`flex justify-between items-center p-4 border rounded-xl bg-white transition-all ${fileState.status === 'verified' ? 'border-green-200 bg-green-50/30' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <div>
                    <span className="block font-medium text-slate-800 text-sm">
                      {doc.label} {doc.required && <span className="text-red-500">*</span>}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    {fileState.status === 'verified' ? (
                      <>
                        <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-100 px-2 py-1 rounded-md">
                          <CheckCircle className="w-3 h-3"/> Verified
                        </span>
                        <button onClick={() => setPreviewDoc(doc.label)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                      </>
                    ) : fileState.status === 'scanning' || fileState.status === 'analyzing' ? (
                      <span className="text-indigo-600 text-xs font-medium flex items-center gap-1 animate-pulse">
                        <Loader2 className="w-3 h-3 animate-spin"/> {fileState.status === 'scanning' ? 'Scanning...' : 'AI Analyzing...'}
                      </span>
                    ) : (
                      <button onClick={() => handleFileUpload(doc.id)} className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                        <Upload className="w-3 h-3"/> Upload
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans relative">
      <Navbar userRole={currentUser} onLogout={handleLogout} onHome={() => setApplicantView('dashboard')} />
      <SpotBot />
      <ActionModal isOpen={modalState.isOpen} type={modalState.type} data={modalState.data} onClose={closeModal} onConfirm={modalState.type === 'revoke' ? executeRevoke : () => {}} />
      <DocPreviewModal isOpen={!!previewDoc} docName={previewDoc} onClose={() => setPreviewDoc(null)} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {applicantView === 'dashboard' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div><h1 className="text-3xl font-bold text-slate-800">Your Applications</h1><p className="text-slate-500">Track status and submit new requests.</p></div>
                <button onClick={() => setApplicantView('modal')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all"><Plus className="w-5 h-5" /> Start New Application</button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-slate-50 border-b border-slate-200"><tr><th className="p-4 text-sm font-bold text-slate-500">Ref ID</th><th className="p-4 text-sm font-bold text-slate-500">Date</th><th className="p-4 text-sm font-bold text-slate-500">Loan Type</th><th className="p-4 text-sm font-bold text-slate-500">Est. Amount</th><th className="p-4 text-sm font-bold text-slate-500">Status</th><th className="p-4 text-sm font-bold text-slate-500 text-right">Action</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {myApps.map((app, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-sm text-slate-600 font-bold">{app.refId}</td><td className="p-4 text-sm text-slate-600">{app.date}</td><td className="p-4 text-sm text-slate-800 font-medium">{app.loanType}</td><td className="p-4 text-sm text-slate-600">{formatCurrency(app.amountRequested)}</td>
                        <td className="p-4"><span className={`text-xs font-bold px-3 py-1 rounded-full ${app.status === 'Approved' ? 'bg-green-100 text-green-700' : app.status === 'Rejected' || app.status === 'Revoked' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>{app.status}</span></td>
                        <td className="p-4 text-right">{app.status === 'Under Review' && (<button onClick={() => handleRevokeClick(app)} className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 rounded-md font-bold transition-colors flex items-center gap-1 ml-auto"><Trash2 className="w-3 h-3" /> Revoke</button>)}</td>
                      </tr>
                    ))}
                    {myApps.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-400">No active applications found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="space-y-6 pt-8 border-t border-slate-200">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div><h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2"><Search className="w-6 h-6 text-indigo-600"/> Legacy Application Database</h2><p className="text-slate-500 text-sm mt-1">Pre-approved offers based on historical data. {latestProfile ? <span className="text-green-600 font-bold ml-2">✓ Profile Verified</span> : <span className="text-orange-500 font-bold ml-2">⚠ Submit a new app to unlock</span>}</p></div>
                <div className="flex flex-wrap gap-2 items-center bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-2 px-2 border-r border-slate-200 mr-2"><Filter className="w-4 h-4 text-slate-400" /><span className="text-xs font-bold text-slate-500 uppercase">Filter:</span><select value={legacyFilter} onChange={(e) => setLegacyFilter(e.target.value)} className="text-xs p-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"><option value="All">All Status</option><option value="Eligible">Eligible Only</option><option value="Ineligible">Ineligible Only</option></select></div>
                  <div className="flex items-center gap-2 px-2 border-r border-slate-200 mr-2"><ArrowUpDown className="w-4 h-4 text-slate-400" /><span className="text-xs font-bold text-slate-500 uppercase">Sort:</span><select value={legacySort} onChange={(e) => setLegacySort(e.target.value)} className="text-xs p-1 bg-slate-50 border border-slate-200 rounded-md text-slate-700 outline-none focus:border-indigo-500 cursor-pointer"><option value="None">None</option><option value="EligibleFirst">Eligible First</option><option value="IneligibleFirst">Ineligible First</option></select></div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left min-w-[800px]">
                  <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                    <tr><th className="p-4 text-xs font-bold text-slate-500 uppercase">Opp ID</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Industry</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Funding Amount</th><th className="p-4 text-xs font-bold text-slate-500 uppercase">Requirements</th><th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Eligibility</th><th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Action</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLegacyData.map((item, i) => {
                      const status = checkLegacyEligibility(item);
                      const isEligible = status === 'Eligible';
                      
                      return (
                        <tr key={i} className={`hover:bg-slate-50 transition-colors ${!isEligible && status !== 'NA' ? 'bg-slate-50/50' : ''}`}>
                          <td className="p-4 font-mono text-xs text-slate-500">{item.refId}</td><td className="p-4 text-sm text-slate-800 font-medium">{item.sector}</td><td className="p-4 text-sm text-slate-600">{formatCurrency(item.amountRequested)}</td><td className="p-4 text-xs text-slate-500">Standard KYC & Income Docs</td>
                          <td className="p-4 text-right">
                             {status === 'NA' ? (<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200"><AlertCircle className="w-3 h-3" /> N/A (Submit App First)</span>) : isEligible ? (<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200"><CheckCircle className="w-3 h-3" /> Eligible</span>) : (<span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200"><XCircle className="w-3 h-3" /> Turnover Low</span>)}
                          </td>
                          <td className="p-4 text-right"><button onClick={() => handleApplyNow(item)} disabled={!latestProfile} className={`text-xs px-4 py-2 rounded-md font-bold flex items-center gap-1 ml-auto transition-all ${latestProfile ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><FileUp className="w-3 h-3" /> {latestProfile ? "Apply Now" : "Locked"}</button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {applicantView === 'modal' && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl p-8 relative border border-slate-100">
              <button onClick={() => setApplicantView('dashboard')} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><XCircle className="w-8 h-8" /></button>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Select Loan Application Type</h2>
              <p className="text-slate-500 mb-8">Choose the category that best fits your business needs.</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button onClick={() => startNewApplication('Working Capital')} className="group text-left p-6 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all"><div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center text-blue-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Briefcase className="w-6 h-6" /></div><h3 className="font-bold text-lg text-slate-800 mb-2">Working Capital</h3><p className="text-sm text-slate-500">Short-term funding.</p></button>
                <button onClick={() => startNewApplication('Business Expansion')} className="group text-left p-6 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all"><div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center text-purple-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><TrendingUp className="w-6 h-6" /></div><h3 className="font-bold text-lg text-slate-800 mb-2">Business Expansion</h3><p className="text-sm text-slate-500">Long-term capital for growth.</p></button>
                <button onClick={() => startNewApplication('Equipment Financing')} className="group text-left p-6 rounded-xl border-2 border-slate-100 hover:border-indigo-600 hover:bg-indigo-50 transition-all"><div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center text-orange-600 mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors"><Truck className="w-6 h-6" /></div><h3 className="font-bold text-lg text-slate-800 mb-2">Equipment Financing</h3><p className="text-sm text-slate-500">Loans for machinery.</p></button>
              </div>
            </div>
          </div>
        )}

        {applicantView === 'wizard' && (
          <div className="max-w-xl mx-auto">
            <button onClick={() => setApplicantView('dashboard')} className="mb-4 text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1">← Back to Dashboard</button>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
               <div className="mb-6"><span className="text-xs font-bold uppercase tracking-wide text-indigo-500">Applying For</span><h2 className="text-2xl font-bold text-slate-900">{loanType}</h2></div>
               {step === 1 && (
                 <div className="space-y-6">
                    <div className="space-y-4">
                      <label className="block"><span className="text-sm font-semibold text-slate-700">Registered Company Name</span><input className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="Acme India Pvt Ltd" /></label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-700">Annual Turnover (₹)</span>
                          <input 
                            type="number" 
                            min="0" 
                            onKeyDown={preventNegative} 
                            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={formData.turnover} 
                            onChange={e => setFormData({...formData, turnover: e.target.value})} 
                            placeholder="4200000" 
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-700">Loan Amount Requested (₹)</span>
                          <input 
                            type="number" 
                            min="0" 
                            onKeyDown={preventNegative} 
                            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={formData.amountRequested} 
                            onChange={e => setFormData({...formData, amountRequested: e.target.value})} 
                            placeholder="1000000" 
                          />
                        </label>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-700">Years Active</span>
                          <input 
                            type="number" 
                            min="0" 
                            onKeyDown={preventNegative} 
                            className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                            value={formData.yearsTrading} 
                            onChange={e => setFormData({...formData, yearsTrading: e.target.value})} 
                            placeholder="3" 
                          />
                        </label>
                        <label className="block">
                          <span className="text-sm font-semibold text-slate-700">Industry Sector</span>
                          <select className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-lg" value={formData.sector} onChange={e => setFormData({...formData, sector: e.target.value})}>
                            <option value="Retail">Retail</option>
                            <option value="Technology">Technology</option>
                            <option value="Manufacturing">Manufacturing</option>
                            <option value="Gambling">Gambling (Restricted)</option>
                          </select>
                        </label>
                      </div>
                    </div>
                    {error && (<div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-100 space-y-2"><div className="flex items-center gap-2 font-bold"><AlertTriangle className="w-5 h-5" /> Eligibility Check Failed</div><p className="text-sm">{error}</p><button onClick={downloadRejectionReport} className="text-xs bg-white border border-red-200 text-red-600 px-3 py-2 rounded-md hover:bg-red-100 flex items-center gap-2 w-fit"><Download className="w-4 h-4" /> Download Official Rejection Report</button></div>)}
                    <button onClick={handleCheckEligibility} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-indigo-200 transition-all flex justify-center items-center gap-2">Check Eligibility <ArrowRight className="w-5 h-5" /></button>
                 </div>
               )}
               {step === 2 && (
                 <div className="space-y-6">
                    <h3 className="font-bold text-lg">Upload Required Documents</h3>
                    {smeCategory && (<div className="bg-green-50 border border-green-200 p-4 rounded-xl flex items-center gap-3 text-sm text-green-800 animate-in fade-in slide-in-from-top-2"><div className="bg-green-200 p-1.5 rounded-full"><Briefcase className="w-4 h-4 text-green-700"/></div><div><strong>Congratulations!</strong> You qualify as a <span className="font-bold uppercase ml-1">{smeCategory}</span>.</div></div>)}
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-sm text-blue-800"><Info className="w-5 h-5 shrink-0"/> All fields marked with * are mandatory. AI Scanning is active.</div>
                    {renderUploadSection()}
                    <button onClick={handleWizardSubmit} disabled={!isAllDocsComplete || isSubmitting} className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2 ${isAllDocsComplete ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit Application <ArrowRight className="w-5 h-5" /></>}</button>
                 </div>
               )}
            </div>
          </div>
        )}

        {applicantView === 'legacy-upload' && selectedLegacyApp && latestProfile && (
          <div className="max-w-xl mx-auto animate-in slide-in-from-bottom-4 duration-300">
            <button onClick={() => setApplicantView('dashboard')} className="mb-4 text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1">← Back to Dashboard</button>
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
               <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                 <span className="text-xs font-bold uppercase tracking-wide text-indigo-600">Applying for Opportunity</span>
                 <h2 className="text-xl font-bold text-slate-900 mt-1">Ref: {selectedLegacyApp.refId} ({selectedLegacyApp.sector})</h2>
                 <div className="mt-2 flex justify-between items-center"><span className="text-sm text-slate-600">Funding Amount:</span><span className="text-lg font-bold text-indigo-700">{formatCurrency(selectedLegacyApp.amountRequested)}</span></div>
               </div>
               <div className="space-y-6">
                  <h3 className="font-bold text-lg flex items-center gap-2"><FileUp className="w-5 h-5 text-indigo-600"/> Upload Required Documents</h3>
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 text-sm text-blue-800"><Info className="w-5 h-5 shrink-0"/> Please provide updated documents for this specific request.</div>
                  {renderUploadSection()}
                  <button onClick={handleLegacySubmit} disabled={!isAllDocsComplete || isSubmitting} className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex justify-center items-center gap-2 ${isAllDocsComplete ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>{isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Submit for Approval <ArrowRight className="w-5 h-5" /></>}</button>
               </div>
            </div>
          </div>
        )}

        {applicantView === 'success' && (
          <div className="max-w-lg mx-auto text-center py-10 bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-10 h-10 text-green-600" /></div>
            <h2 className="text-2xl font-bold text-slate-900">Application Submitted!</h2>
            <p className="text-slate-500 mb-6">Ref ID: <span className="font-mono font-bold text-slate-800">{submissionResult?.refId}</span></p>
            <button onClick={() => setApplicantView('dashboard')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold">Return to Dashboard</button>
          </div>
        )}
      </main>
    </div>
  );
}