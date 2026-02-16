import React, { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    // Initialize synchronously to avoid flash/latency
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const storedUser = localStorage.getItem('user_info');
            return storedUser ? JSON.parse(storedUser) : null;
        } catch (e) {
            console.error("Failed to parse user info", e);
            return null;
        }
    });
    const [loading, setLoading] = useState(false);

    // Async Hydration: Fetch profile icon if missing (e.g., from fresh reload)
    useEffect(() => {
        if (currentUser && currentUser.id && !currentUser.profile_icon && !loading) {
            const fetchIcon = async () => {
                try {
                    const token = localStorage.getItem('auth_token');
                    if (!token) return;

                    // Determine endpoint based on role or try both if uncertain (usually role is in storage)
                    // If role is missing, we might default to Staff or check both.
                    // But login() saves role, so it should be there.
                    let endpoint = null;
                    if (currentUser.role === 'Admin') {
                        endpoint = `http://localhost:17221/api/admins/${currentUser.id}`;
                    } else {
                        endpoint = `http://localhost:17221/api/staff/${currentUser.id}`;
                    }

                    const res = await fetch(endpoint, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.profile_icon) {
                            // Update state only - DO NOT write to localStorage to keep it light
                            setCurrentUser(prev => ({ ...prev, profile_icon: data.profile_icon }));
                        }
                    }
                } catch (err) {
                    console.error("UserContext: Background icon fetch failed", err);
                }
            };
            fetchIcon();
        }
    }, [currentUser?.id, currentUser?.role]); // Only re-run if user ID changes

    const login = (userData, token) => {
        localStorage.setItem('auth_token', token);

        // Optimize: Strip profile_icon for storage
        // eslint-disable-next-line no-unused-vars
        const { profile_icon, ...storageUser } = userData;
        localStorage.setItem('user_info', JSON.stringify(storageUser));

        // State gets full object
        setCurrentUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_info');
        setCurrentUser(null);
    };

    const updateUser = (updates) => {
        let userToUpdate = currentUser;

        // Fallback: Try to get from localStorage if state is null
        if (!userToUpdate) {
            try {
                const stored = localStorage.getItem('user_info');
                if (stored) userToUpdate = JSON.parse(stored);
            } catch (e) {
                console.error("UserContext: Failed to parse storage for update", e);
            }
        }

        if (!userToUpdate) {
            console.error("UserContext: Cannot update user, no user found.");
            return;
        }

        const updatedUser = { ...userToUpdate, ...updates };
        console.log("UserContext: Updating user", updatedUser);

        // Optimize: Strip profile_icon for storage
        // eslint-disable-next-line no-unused-vars
        const { profile_icon, ...storageUser } = updatedUser;
        localStorage.setItem('user_info', JSON.stringify(storageUser));

        // State gets full object
        setCurrentUser(updatedUser);

        // Dispatch a custom event for non-React components if any
        window.dispatchEvent(new Event('user-updated'));
    };

    const refreshUser = () => {
        const storedUser = localStorage.getItem('user_info');
        if (storedUser) {
            setCurrentUser(JSON.parse(storedUser));
        }
    };

    const value = React.useMemo(() => ({
        currentUser, loading, login, logout, updateUser, refreshUser
    }), [currentUser, loading]);

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
