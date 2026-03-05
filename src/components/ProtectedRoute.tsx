import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireRole?: 'student' | 'admin' | Array<'student' | 'admin'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireRole }) => {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requireRole && user?.role !== 'admin') {
        const hasRequiredRole = Array.isArray(requireRole)
            ? requireRole.includes(user?.role as 'student' | 'admin')
            : user?.role === requireRole;

        if (!hasRequiredRole) {
            return <Navigate to="/student" replace />;
        }
    }

    return <>{children}</>;
};
