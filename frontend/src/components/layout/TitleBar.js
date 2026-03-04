import React, { useState, useEffect } from 'react';
import { Minus, Square, X } from 'lucide-react';
import logo from '../../assets/logo.png'; // Make sure this path fits your structure

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const formatDateTime = (date) => {
    const day = DAYS[date.getDay()];
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    let hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    const hh = String(hours).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const sec = String(date.getSeconds()).padStart(2, '0');

    return `${day}, ${dd}/${mm}/${yyyy} — ${hh}:${min}:${sec} ${ampm}`;
};

const TitleBar = () => {
    const [isMaximized, setIsMaximized] = useState(true);
    const [dateTime, setDateTime] = useState(formatDateTime(new Date()));

    useEffect(() => {
        const timer = setInterval(() => {
            setDateTime(formatDateTime(new Date()));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleMinimize = () => {
        if (window.electron && window.electron.windowControl) {
            window.electron.windowControl.minimize();
        }
    };

    const handleMaximize = () => {
        if (window.electron && window.electron.windowControl) {
            window.electron.windowControl.maximize();
            setIsMaximized(!isMaximized);
        }
    };

    const handleClose = () => {
        if (window.electron && window.electron.windowControl) {
            window.electron.windowControl.close();
        }
    };

    return (
        <div className="custom-titlebar">
            <div className="titlebar-drag-region">
                <div className="titlebar-icon">
                    <img src={logo} alt="App Icon" />
                </div>
                <div className="titlebar-title">GPTK Library Manager</div>
                <div className="titlebar-datetime">{dateTime}</div>
            </div>

            <div className="window-controls">
                <button className="control-btn minimize-btn" onClick={handleMinimize} title="Minimize">
                    <Minus size={16} />
                </button>
                <button className="control-btn maximize-btn" onClick={handleMaximize} title="Maximize">
                    <Square size={14} />
                </button>
                <button className="control-btn close-btn" onClick={handleClose} title="Close">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default TitleBar;
