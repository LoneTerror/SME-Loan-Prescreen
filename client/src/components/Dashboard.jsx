import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LayoutDashboard, LogOut, CheckCircle, XCircle, Clock, 
  TrendingUp, Loader2, PieChart as PieIcon, BarChart as BarIcon
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import logo from '../assets/logo.png'; 

// --- CONFIGURATION ---
// DEVELOPMENT URL (For Local Testing)
// const API_URL = 'http://localhost:3000'; 

// PRODUCTION URL (Keep active for deployment)
const API_URL = 'https://backend.spot-check.site';

// --- SHARED NAVBAR COMPONENT (Configured for Admin) ---
const AdminNavbar = ({ onLogout }) => (
  <nav className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40 shadow-lg">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        
        {/* Branding */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="SpotCheck" className="w-8 h-8 object-contain" />
          <span className="font-bold text-xl text-slate-100 tracking-tight">Bank Portal</span>
        </div>
        
        {/* User Info & Logout */}
        <div className="flex items-center gap-5">
          
          {/* Admin Profile Pill */}
          <div className="hidden md:flex items-center gap-3 bg-slate-700/50 pl-2 pr-4 py-1.5 rounded-full border border-slate-600/50">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm bg-indigo-500">
              AD
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-slate-100 leading-none mb-0.5">Administrator</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide leading-none">Bank Staff Access</span>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-slate-700"></div>

          {/* Logout Button */}
          <button 
            onClick={onLogout} 
            className="group flex items-center gap-2 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium"
          >
            <LogOut className="w-4 h-4 group-hover:stroke-red-400" /> 
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  </nav>
);

export default function Dashboard({ onBack }) {
  // State for storing application data, UI loading state, aggregated stats, and chart data
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, value: 0 });
  const [chartData, setChartData] = useState({ status: [], sector: [] });

  /**
   * Fetches all loan applications from the backend API.
   * On success, it populates the table, calculates KPIs, and generates chart data.
   */
  const fetchApplications = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/applications`);
      const data = res.data.data;
      setApps(data);
      calculateStats(data);
      prepareCharts(data); 
      setLoading(false);
    } catch (err) {
      alert("Failed to fetch data from backend");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  /**
   * Calculates high-level metrics for the top KPI cards.
   * Sums up total applications, pending count, and total requested loan value.
   */
  const calculateStats = (data) => {
    const total = data.length;
    const pending = data.filter(a => a.status === 'Under Review').length;
    const value = data.reduce((acc, curr) => acc + (curr.amountRequested || 0), 0);
    setStats({ total, pending, value });
  };

  /**
   * Transforms raw application data into formats compatible with Recharts.
   * 1. Status Distribution: Counts apps per status type.
   * 2. Sector Demand: Sums requested loan amounts per industry sector.
   */
  const prepareCharts = (data) => {
    const statusCount = data.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {});
    
    const statusData = [
      { name: 'Approved', value: statusCount['Approved'] || 0, color: '#22c55e' },
      { name: 'Rejected', value: statusCount['Rejected'] || 0, color: '#ef4444' },
      { name: 'Review', value: statusCount['Under Review'] || 0, color: '#f97316' },
      { name: 'Revoked', value: statusCount['Revoked'] || 0, color: '#94a3b8' },
    ].filter(item => item.value > 0);

    const sectorMap = data.reduce((acc, curr) => {
      const sector = curr.sector || 'Unknown';
      acc[sector] = (acc[sector] || 0) + (curr.amountRequested || 0);
      return acc;
    }, {});

    const sectorData = Object.keys(sectorMap).map(key => ({
      name: key,
      amount: sectorMap[key] / 100000 
    }));

    setChartData({ status: statusData, sector: sectorData });
  };

  /**
   * Updates the status of a specific application (Approve/Reject).
   * Uses optimistic UI updates for immediate feedback before the API call completes.
   */
  const handleStatusUpdate = async (refId, newStatus) => {
    setApps(prev => prev.map(app => app.refId === refId ? { ...app, status: newStatus } : app));
    try {
      await axios.post(`${API_URL}/api/status`, { refId, status: newStatus });
      fetchApplications();
    } catch (err) {
      alert("Error updating status");
      fetchApplications(); 
    }
  };

  /**
   * Helper utility to format numbers into Indian Currency format (e.g., ₹ 1,00,000).
   */
  const formatCurrency = (val) => {
    if (!val) return '₹ 0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] font-sans">
      
      <AdminNavbar onLogout={onBack} />

      <main className="max-w-7xl mx-auto p-8">
        
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
            <p className="text-slate-500 text-sm font-bold uppercase">Queue Total</p>
            <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
             <p className="text-slate-500 text-sm font-bold uppercase">Pending Action</p>
             <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
             <p className="text-slate-500 text-sm font-bold uppercase">Total Loan Demand</p>
             <p className="text-3xl font-bold text-green-600">{formatCurrency(stats.value)}</p>
          </div>
        </div>

        {/* Data Visualization Section */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-indigo-500"/> Application Status
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData.status}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartData.status.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center gap-2">
                <BarIcon className="w-5 h-5 text-indigo-500"/> Demand by Sector (₹ Lakhs)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.sector}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis />
                    <Tooltip formatter={(value) => `₹ ${value.toFixed(2)} L`} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Applications Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <div className="p-6 border-b border-slate-200 flex justify-between items-center min-w-[1000px]">
            <h2 className="text-lg font-bold text-slate-800">Application Queue</h2>
            <button onClick={fetchApplications} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              <TrendingUp className="w-4 h-4"/> Refresh Data
            </button>
          </div>

          {loading ? (
            <div className="p-10 text-center text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2"/> Loading Database...
            </div>
          ) : (
            <table className="w-full text-left min-w-[1000px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Ref ID</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Company</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Turnover</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-indigo-600">Loan Amount</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Sector</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {apps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-mono text-sm font-bold text-slate-600">{app.refId}</td>
                    <td className="p-4 text-sm font-semibold text-slate-800">
                      {app.companyName}
                      <span className="block text-xs text-slate-400 font-normal">{app.loanType} ({app.yearsTrading} Yrs)</span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{formatCurrency(app.turnover)}</td>
                    <td className="p-4 text-sm font-bold text-indigo-700 bg-indigo-50/50">{formatCurrency(app.amountRequested)}</td>
                    <td className="p-4 text-sm text-slate-600"><span className="px-2 py-1 bg-slate-100 rounded text-xs border border-slate-200">{app.sector}</span></td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border
                        ${app.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' : 
                          app.status === 'Rejected' || app.status === 'Revoked' ? 'bg-red-100 text-red-800 border-red-200' : 
                          'bg-orange-100 text-orange-800 border-orange-200'}`}>
                        {app.status === 'Approved' && <CheckCircle className="w-3 h-3"/>}
                        {app.status === 'Rejected' && <XCircle className="w-3 h-3"/>}
                        {app.status === 'Under Review' && <Clock className="w-3 h-3"/>}
                        {app.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {app.status === 'Under Review' && (
                        <>
                          <button onClick={() => handleStatusUpdate(app.refId, 'Approved')} className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 px-3 py-1 rounded-md text-xs font-bold transition-colors">Approve</button>
                          <button onClick={() => handleStatusUpdate(app.refId, 'Rejected')} className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1 rounded-md text-xs font-bold transition-colors">Reject</button>
                        </>
                      )}
                      {app.status !== 'Under Review' && <span className="text-xs text-slate-400 italic">Processed</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}