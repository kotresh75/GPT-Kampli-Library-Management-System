import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Shield, Users, BarChart2, Github, Globe, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import logo from '../assets/logo.png';

const AboutPage = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();

    const features = [
        { icon: BookOpen, title: 'Smart Catalog', desc: 'Efficient book tracking with ISBN scanning and auto-enrichment.' },
        { icon: Users, title: 'Member Management', desc: 'Streamlined student and staff profiles with digital ID cards.' },
        { icon: BarChart2, title: 'Analytics', desc: 'Real-time dashboard and comprehensive reports.' },
        { icon: Shield, title: 'Secure & Robust', desc: 'Role-based access control with secure authentication.' }
    ];

    return (
        <div className="landing-container" style={{ alignItems: 'flex-start', paddingTop: '40px', paddingBottom: '40px' }}>
            <div className="gradient-bg"></div>

            <div className="landing-panel glass-panel animate-fade-in-up" style={{ margin: '0 auto' }}>
                <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                    <button onClick={() => navigate(-1)} className="icon-btn" title="Go Back">
                        <ArrowLeft size={20} /> Back
                    </button>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Info size={24} /> About Project
                    </h1>
                    <div style={{ width: '44px' }}></div> {/* Spacer */}
                </header>

                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img src={logo} alt="GPTK LMS Logo" style={{ height: '100px', marginBottom: '15px' }} />
                    <h2 className="hero-title" style={{ fontSize: '2.5rem', marginBottom: '5px' }}>GPTK LMS</h2>
                    <p className="subtitle" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>Library Management System</p>
                    <div style={{ margin: '10px auto', display: 'inline-block', padding: '4px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', border: '1px solid var(--glass-border)' }}>
                        v1.0.0 (Stable)
                    </div>
                </div>

                <div className="section" style={{ textAlign: 'left' }}>
                    <p style={{ lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '30px' }}>
                        The <strong>GPTK Library Management System</strong> is a state-of-the-art solution designed to digitize and automate the operations of Government Polytechnic libraries. Built with modern web technologies, it offers a seamless experience for librarians, staff, and students, ensuring efficient resource management and simplified circulation workflows.
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                        {features.map((f, i) => (
                            <div key={i} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
                                <div style={{ width: '50px', height: '50px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto', color: '#6366f1' }}>
                                    <f.icon size={24} />
                                </div>
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>{f.title}</h3>
                                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <footer style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <p>Designed & Developed for Government Polytechnic.</p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '10px' }}>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'inherit', textDecoration: 'none' }}>
                            <Github size={16} /> GitHub
                        </a>
                        <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'inherit', textDecoration: 'none' }}>
                            <Globe size={16} /> Website
                        </a>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default AboutPage;
