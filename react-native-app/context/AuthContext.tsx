import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Role = 'student' | 'admin';

interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string; role?: string }>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_KEY = 'lumina_user';
const TOKEN_KEY = 'lumina_token';
import { API as API_URL } from '../app/constants/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUser = async () => {
            try {
                const savedUser = await AsyncStorage.getItem(USER_KEY);
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            } catch (e) {
                console.error('Failed to load user', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadUser();
    }, []);

    const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
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
            await AsyncStorage.setItem(USER_KEY, JSON.stringify(loggedUser));
            await AsyncStorage.setItem(TOKEN_KEY, data.token);
            return { success: true, role: loggedUser.role };
        } catch (err) {
            console.error('Login error:', err);
            return { success: false, error: 'Желі қатесі. Интернет байланысын тексеріңіз.' };
        }
    };

    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem(USER_KEY);
        await AsyncStorage.removeItem(TOKEN_KEY);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isLoading }}>
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

export async function getToken(): Promise<string | null> {
    try {
        return await AsyncStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}
