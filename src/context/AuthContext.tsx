import React, { createContext, useContext, useState, ReactNode } from 'react';

type Role = 'student' | 'admin';

interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'lumina_user';
const TOKEN_KEY = 'lumina_token';

function getSavedUser(): User | null {
    try {
        const s = localStorage.getItem(USER_KEY);
        return s ? JSON.parse(s) : null;
    } catch {
        return null;
    }
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(getSavedUser);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                return { success: false, error: data.error || 'Login failed' };
            }
            const loggedUser: User = {
                id: String(data.user.id),
                name: data.user.name,
                email: data.user.email,
                role: data.user.role as Role,
            };
            setUser(loggedUser);
            localStorage.setItem(USER_KEY, JSON.stringify(loggedUser));
            localStorage.setItem(TOKEN_KEY, data.token);
            return { success: true };
        } catch (err) {
            return { success: false, error: 'Network error. Make sure the server is running.' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

/** Helper: get JWT token for API calls */
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}
