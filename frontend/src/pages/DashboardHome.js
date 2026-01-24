import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { usePreferences } from '../context/PreferencesContext';
import { Book, Users, Repeat, AlertCircle, DollarSign, PackageX } from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell
} from 'recharts';

import StatsCard from '../components/dashboard/StatsCard';
import ChartWidget from '../components/dashboard/ChartWidget';
import RecentAuditTable from '../components/dashboard/RecentAuditTable';
import DashboardDetailModal from '../components/dashboard/DashboardDetailModal';

const DashboardHome = () => {
    const navigate = useNavigate();
    // Removed t()
    const [stats, setStats] = useState({
        totalBooks: 0,
        totalStudents: 0,
        booksIssuedToday: 0,
        overdueBooks: 0,
        totalFines: 0,
        lostBooks: 0
    });

    const [charts, setCharts] = useState({
        booksByDept: [],
        studentsByDept: [],
        mostIssuedBooks: []
    });

    const [recentLogs, setRecentLogs] = useState([]);

    const [modalType, setModalType] = useState(null); // 'issued_today', 'overdue', 'lost_damaged'

    // Get User Permissions
    const userInfo = JSON.parse(localStorage.getItem('user_info') || '{}');
    const userRole = userInfo.role || 'Guest';
    const userPermissions = userInfo.permissions || [];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const statsRes = await axios.get('http://localhost:3001/api/dashboard/stats');
                setStats(statsRes.data);

                const chartsRes = await axios.get('http://localhost:3001/api/dashboard/charts');
                setCharts(chartsRes.data);

                const logsRes = await axios.get('http://localhost:3001/api/dashboard/logs');
                setRecentLogs(logsRes.data.recent || []);
            } catch (error) {
                console.error("Dashboard Data Error:", error);
            }
        };
        fetchData();
    }, []);

    // Colors for Pie Chart
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1919'];

    return (
        <div className="dashboard-content">
            <h1 className="dashboard-title mb-6">Dashboard Overview</h1>

            {/* KPI Section - Grid with Navigation */}
            <div className="dashboard-kpi-grid">
                {(userRole === 'Admin' || userPermissions.includes('CATALOG')) && (
                    <StatsCard
                        title="Total Books"
                        value={stats.totalBooks}
                        icon={Book}
                        color="blue"
                        onClick={() => navigate('/dashboard/books')}
                    />
                )}
                {(userRole === 'Admin' || userPermissions.includes('STUDENTS')) && (
                    <StatsCard
                        title="Total Students"
                        value={stats.totalStudents}
                        icon={Users}
                        color="purple"
                        onClick={() => navigate('/dashboard/members')}
                    />
                )}
                {(userRole === 'Admin' || userPermissions.includes('CIRCULATION')) && (
                    <>
                        <StatsCard
                            title="Issued Today"
                            value={stats.booksIssuedToday}
                            icon={Repeat}
                            color="green"
                            onClick={() => setModalType('issued_today')}
                        />
                        <StatsCard
                            title="Overdue Books"
                            value={stats.overdueBooks}
                            icon={AlertCircle}
                            color="orange"
                            onClick={() => setModalType('overdue')}
                        />
                    </>
                )}
                {(userRole === 'Admin' || userPermissions.includes('CIRCULATION')) && (
                    <StatsCard
                        title="Fines Collected"
                        value={`₹${stats.totalFines}`}
                        icon={DollarSign}
                        color="emerald"
                        onClick={() => navigate('/dashboard/circulation', { state: { activeTab: 'fines', fineSubTab: 'history' } })}
                    />
                )}
                {(userRole === 'Admin' || userPermissions.includes('CIRCULATION')) && (
                    <StatsCard
                        title="Lost/Damaged"
                        value={stats.lostBooks}
                        icon={PackageX}
                        color="red"
                        onClick={() => setModalType('lost_damaged')}
                    />
                )}
            </div>

            {/* Charts Section - Grid */}
            <div className="dashboard-charts-grid">
                {(userRole === 'Admin' || userPermissions.includes('CATALOG')) && (
                    <ChartWidget title="Books by Department">
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts.booksByDept}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {charts.booksByDept.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartWidget>
                )}

                {(userRole === 'Admin' || userPermissions.includes('STUDENTS')) && (
                    <ChartWidget title="Active Students">
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={charts.studentsByDept}>
                                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} interval={0} angle={-30} textAnchor="end" height={60} />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                                    <Bar dataKey="value" fill="#4ADE80" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </ChartWidget>
                )}

                {(userRole === 'Admin' || userPermissions.includes('CIRCULATION')) && (
                    <ChartWidget title="Trending Books">
                        <div className="chart-container flex flex-col justify-center">
                            {charts.mostIssuedBooks && charts.mostIssuedBooks.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart layout="vertical" data={charts.mostIssuedBooks} margin={{ left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                                        <XAxis type="number" stroke="#94a3b8" hide />
                                        <YAxis dataKey="name" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 11 }} />
                                        <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }} />
                                        <Bar dataKey="value" fill="#F472B6" radius={[0, 4, 4, 0]} barSize={20} />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-gray-500">No issuance data yet.</p>
                            )}
                        </div>
                    </ChartWidget>
                )}
            </div>

            {/* Audit & Compliance Section - Admin Only */}
            {(userRole === 'Admin' || userPermissions.includes('ADMIN')) && (
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="dashboard-title">Recent Activity</h2>
                        <button onClick={() => navigate('/dashboard/audit')} className="text-sm text-emerald-400 hover:text-emerald-300">
                            View Full Audit &rarr;
                        </button>
                    </div>
                    <RecentAuditTable logs={recentLogs} />
                </div>
            )}

            {/* Detail Modal */}
            {modalType && (
                <DashboardDetailModal
                    type={modalType}
                    onClose={() => setModalType(null)}
                />
            )}
        </div>
    );
};

export default DashboardHome;
