import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import API_BASE from '../config/apiConfig';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Connect to backend
        // Assuming backend is on port 17221
        // In production, this should be an env var
        const newSocket = io(API_BASE);

        newSocket.on('connect', () => {
            console.log('[Socket] Connected to backend');
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
