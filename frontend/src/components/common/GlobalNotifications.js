import React, { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import ReactDOM from 'react-dom';

const Toast = ({ type, message, onClose }) => {
    let icon = <Info size={18} />;
    let bgColor = 'var(--glass-bg)';
    let borderColor = 'var(--glass-border)';

    switch (type) {
        case 'success':
            icon = <CheckCircle size={18} color="#48bb78" />;
            borderColor = 'rgba(72, 187, 120, 0.5)';
            break;
        case 'error':
            icon = <AlertCircle size={18} color="#f56565" />;
            borderColor = 'rgba(245, 101, 101, 0.5)';
            break;
        case 'warning':
            icon = <AlertTriangle size={18} color="#ed8936" />;
            borderColor = 'rgba(237, 137, 54, 0.5)';
            break;
        default:
            break;
    }

    return (
        <div className="glass-panel bounce-in" style={{
            padding: '12px 16px',
            marginBottom: '10px',
            width: '300px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            borderLeft: `4px solid ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : type === 'warning' ? '#ed8936' : '#4299e1'}`,
            border: `1px solid ${borderColor}`,
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            pointerEvents: 'auto'
        }}>
            {icon}
            <p style={{ margin: 0, fontSize: '0.9rem', flex: 1 }}>{message}</p>
            <button onClick={onClose} className="icon-btn-sm">
                <X size={14} />
            </button>
        </div>
    );
};

const GlobalNotifications = () => {
    const socket = useSocket();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        if (!socket) return;

        const handleNotification = (data) => {
            // data: { type: 'success'|'error'|'warning', message: '...' }
            const id = Date.now();
            setNotifications(prev => [...prev, { ...data, id }]);

            // Auto remove
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, 5000);
        };

        socket.on('notification', handleNotification);

        return () => {
            socket.off('notification', handleNotification);
        };
    }, [socket]);

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return ReactDOM.createPortal(
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            pointerEvents: 'none' // Click through container
        }}>
            {notifications.map(n => (
                <Toast key={n.id} type={n.type} message={n.message} onClose={() => removeNotification(n.id)} />
            ))}
        </div>,
        document.body
    );
};

export default GlobalNotifications;
