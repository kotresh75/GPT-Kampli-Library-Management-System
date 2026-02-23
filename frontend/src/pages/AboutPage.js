import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Shield, Users, BarChart2, Github, Globe, Info, Database, Server, Layers, Code, Languages, CheckCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.png';

const AboutPage = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const currentYear = new Date().getFullYear();

    const features = [
        { icon: BookOpen, title: t('about.features.smart_catalog.title') || 'Smart Catalog', desc: t('about.features.smart_catalog.desc') || 'Efficient book tracking with ISBN scanning and auto-enrichment.' },
        { icon: Users, title: t('about.features.member_mgmt.title') || 'Member Management', desc: t('about.features.member_mgmt.desc') || 'Streamlined student and staff profiles with digital ID cards.' },
        { icon: BarChart2, title: t('about.features.analytics.title') || 'Analytics', desc: t('about.features.analytics.desc') || 'Real-time dashboard and comprehensive reports.' },
        { icon: Shield, title: t('about.features.secure.title') || 'Secure & Robust', desc: t('about.features.secure.desc') || 'Role-based access control with secure authentication.' },
        { icon: Languages, title: t('about.features.multilang.title') || 'Multi-language Support', desc: t('about.features.multilang.desc') || 'Process transactions in English and Kannada.' }
    ];

    const objectives = t('about.objectives.list', { returnObjects: true }) || [
        "To automate the issuance and return of books.",
        "To provide a searchable digital catalog for students and staff.",
        "To generate accurate reports on circulation and fines.",
        "To ensure data security and role-based access control."
    ];

    const techStack = [
        { icon: Code, name: 'React.js' },
        { icon: Layers, name: 'Electron' },
        { icon: Server, name: 'Node.js' },
        { icon: Database, name: 'SQLite' }
    ];

    const teamMembers = t('about.team_members', { returnObjects: true }) || [
        { name: 'Kotresh C', regNo: '172CS23021' },
        { name: 'M Gayana', regNo: '172CS23024' },
        { name: 'Jayanth', regNo: '172CS23016' }
    ];

    return (
        <div className="landing-container" style={{ alignItems: 'flex-start', paddingTop: '40px', paddingBottom: '40px' }}>
            <div className="gradient-bg"></div>

            <div className="landing-panel glass-panel animate-fade-in-up" style={{ margin: '0 auto' }}>
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <button onClick={() => navigate(-1)} className="icon-btn" title={t('common.back') || "Go Back"}>
                        <ArrowLeft size={20} /> {t('common.back') || "Back"}
                    </button>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Info size={24} /> {t('about.title') || "About Project"}
                    </h1>
                    <div style={{ width: '44px' }}></div> {/* Spacer */}
                </header>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img src={logo} alt="GPTK LMS Logo" style={{ height: '80px', marginBottom: '10px', display: 'block', margin: '0 auto 10px auto' }} />
                    <h2 className="hero-title" style={{ fontSize: '2rem', marginBottom: '5px' }}>GPTK LMS</h2>
                    <p className="subtitle" style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>{t('app.subtitle') || "Library Management System"}</p>
                </div>

                <div className="section" style={{ textAlign: 'left', padding: '0 10px' }}>

                    {/* 1. Project Overview */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 className="settings-page-title" style={{ marginTop: 0 }}>{t('about.overview.title') || "1. Project Overview"}</h3>
                        <p style={{ lineHeight: '1.6', marginBottom: '10px', fontSize: '0.95rem' }}>{t('about.overview.p1') || "The GPTK Library Management System is a comprehensive software solution designed to modernize the library operations of Government Polytechnic, Kampli."}</p>
                        <p style={{ lineHeight: '1.6', marginBottom: '10px', fontSize: '0.95rem' }}>{t('about.overview.p2') || "The primary purpose of this system is to streamline the cataloging, circulation, and tracking of library resources. It solves the problems of time-consuming manual searches and tracking."}</p>
                        <p style={{ lineHeight: '1.6', fontSize: '0.95rem' }}>{t('about.overview.p3') || "Target users include Librarians, Staff, and Students."}</p>
                    </div>

                    {/* 2. Objectives */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 className="settings-page-title">{t('about.objectives.title') || "2. Objectives"}</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {Array.isArray(objectives) && objectives.map((obj, i) => (
                                <li key={i} style={{ display: 'flex', gap: '10px', marginBottom: '8px', fontSize: '0.95rem' }}>
                                    <CheckCircle size={18} color="var(--accent-color)" style={{ minWidth: '18px' }} />
                                    <span>{obj}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* 3. Key Features */}
                    <div style={{ marginBottom: '30px' }}>
                        <h3 className="settings-page-title">{t('about.key_features.title') || "3. Key Features"}</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px' }}>
                            {features.map((f, i) => (
                                <div key={i} className="glass-card" style={{ padding: '15px', textAlign: 'center' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '5px' }}>{f.title}</h4>
                                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 4. Declaration / Copyright */}
                    <div style={{ marginBottom: '30px', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                        <h3 className="settings-page-title" style={{ fontSize: '1.1rem' }}>{t('about.declaration.title') || "4. Declaration / Copyright"}</h3>
                        <p style={{ fontSize: '0.9rem', fontStyle: 'italic', color: 'var(--text-secondary)' }}>
                            {t('about.declaration.text', { year: currentYear }) || `This project is developed strictly for academic purposes as part of the curriculum. © ${currentYear} Dept of CS&E, GPT Kampli.`}
                        </p>
                    </div>

                    {/* Teams & Guide */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '40px' }}>

                        {/* Student Team */}
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '5px' }}>
                                {t('about.developed_by_dept') || "Developed By (Students)"}
                            </h4>
                            <p style={{ fontSize: '0.9rem', marginBottom: '10px', color: 'var(--text-secondary)' }}>{t('about.batch') || "Batch 2023-2026"}</p>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {Array.isArray(teamMembers) && teamMembers.map((member, i) => (
                                    <li key={i} style={{ marginBottom: '8px', fontSize: '0.95rem' }}>
                                        <strong>{member.name}</strong> <span style={{ opacity: 0.7 }}>({member.regNo})</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Project Guide */}
                        <div>
                            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '15px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '5px' }}>
                                {t('about.guide.title') || "Project Guide"}
                            </h4>
                            <div style={{ padding: '10px', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                                <p style={{ fontWeight: 'bold', fontSize: '0.95rem', color: 'var(--text-primary)' }}>
                                    {t('about.guide.name') || "Sri. Prashanth H. A."}
                                    <sub style={{ fontSize: '0.75em', marginLeft: '5px' }}>{t('about.guide.qualification') || "B.E., M.Tech.,(PhD)"}</sub>
                                </p>
                                <p style={{ fontSize: '0.85rem', marginTop: '2px', color: 'var(--text-secondary)' }}>{t('about.guide.designation') || "Selection Grade-I Lecturer"}</p>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t('about.guide.dept') || "Dept. of CS&E, GPT, Kampli"}</p>
                            </div>
                        </div>
                    </div>

                </div>

                <footer style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                        <span onClick={() => window.electron.openExternal("https://github.com/kotresh75/GPT-Kampli-Library-Management-System.git")} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: 'inherit', textDecoration: 'none', padding: '5px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px' }}>
                            <Github size={16} /> GitHub
                        </span>
                        <span onClick={() => window.electron.openExternal("https://gptklibrary-students.pages.dev/")} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: 'inherit', textDecoration: 'none', padding: '5px 10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px' }}>
                            <Globe size={16} /> Student Portal
                        </span>
                    </div>
                </footer>
            </div >
        </div >
    );
};

export default AboutPage;
