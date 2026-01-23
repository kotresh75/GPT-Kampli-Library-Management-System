import React from 'react';
import { usePreferences } from '../../context/PreferencesContext';

const Footer = () => {

    return (
        <footer className="glass-footer">
            <p>© {new Date().getFullYear()} GPTK Library Management System. All rights reserved. v1.0.0</p>
        </footer>
    );
};

export default Footer;
