import React, { useState } from 'react';
import { Minus, Square, X } from 'lucide-react';
import logo from '../../assets/logo.png'; // Make sure this path fits your structure

const TitleBar = () => {
    const [isMaximized, setIsMaximized] = useState(true);

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
