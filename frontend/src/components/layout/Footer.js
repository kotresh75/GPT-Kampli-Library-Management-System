import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
    const [appVersion, setAppVersion] = useState('1.0.0');

    useEffect(() => {
        if (window.electron?.getAppVersion) {
            window.electron.getAppVersion().then(v => setAppVersion(v));
        }
    }, []);

    return (
        <footer className="glass-footer">
            <div className="footer-content">
                <span className="footer-copy">
                    © {new Date().getFullYear()} GPT Kampli Library Management System
                </span>
                <span className="footer-dot">•</span>
                <span className="footer-made">
                    Made with <Heart size={12} className="footer-heart" /> by GPT Kampli CSE
                </span>
                <span className="footer-dot">•</span>
                <span className="footer-version">v{appVersion}</span>
            </div>
        </footer>
    );
};

export default Footer;
