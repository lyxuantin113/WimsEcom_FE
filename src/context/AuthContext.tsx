import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getToken, setToken } from '../utils/authUtils';
import authApi from '../api/authApi';

interface User {
    username: string;
    role: string;
}

interface AuthContextType {
    isLoggedIn: boolean;
    user: User | null;
    login: (token: string, username: string, role: string) => void;
    logout: () => void;
    setIsAuthLoading: (loading: boolean) => void;
    isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => {
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('user_role');
        return username && role ? { username, role } : null;
    });
    const [token, setTokenState] = useState<string | null>(getToken());
    const [isAuthLoading, setIsAuthLoading] = useState(true);

    const login = useCallback((newToken: string, username: string, role: string) => {
        setToken(newToken); // Sync với authUtils cho axios
        setTokenState(newToken); // Trigger re-render trong React
        localStorage.setItem('username', username);
        localStorage.setItem('user_role', role);
        setUser({ username, role });
    }, []);

    const logout = useCallback(async () => {
        try {
            // 1. Gọi API xóa Cookie ở BE
            await authApi.logout();
        } catch (err) {
            console.error("Logout API failed", err);
        } finally {
            // 2. Xóa sạch state và storage ở FE bất kể API thành công hay không
            setToken(null);
            setTokenState(null);
            localStorage.removeItem('username');
            localStorage.removeItem('user_role');
            setUser(null);
        }
    }, []);

    // Đồng bộ token từ authUtils (phòng trường hợp được set bên ngoài)
    useEffect(() => {
        const currentToken = getToken();
        if (currentToken && !token) {
            setTokenState(currentToken);
        }
        setIsAuthLoading(false);
    }, [token]);

    return (
        <AuthContext.Provider value={{ 
            // isLoggedIn nên là true nếu có user, cho dù token chưa được refresh xong (App.tsx sẽ lo việc đó)
            // Điều này giúp UI ổn định (giữ đúng Header) khi refresh trang.
            isLoggedIn: !!user, 
            user, 
            login, 
            logout,
            isAuthLoading,
            setIsAuthLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth phải được dùng trong AuthProvider');
    }
    return context;
};
