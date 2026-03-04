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
            await authApi.logout();
        } catch (err) {
            console.error("Logout API failed", err);
        } finally {
            setToken(null);
            setTokenState(null);
            localStorage.removeItem('username');
            localStorage.removeItem('user_role');
            setUser(null);
        }
    }, []);

    // 3. Khôi phục session khi mount
    useEffect(() => {
        const silentRefresh = async () => {
            const hasSession = localStorage.getItem('username');
            if (!hasSession) {
                setIsAuthLoading(false);
                return;
            }

            try {
                const response = await authApi.refreshToken();
                if (response && response.code === 1000 && response.result) {
                    login(response.result.token, response.result.username, response.result.role);
                }
            } catch (error: any) {
                console.error("Initial recovery failed", error);
                if (error.response?.status === 401) {
                    logout();
                }
            } finally {
                setIsAuthLoading(false);
            }
        };

        silentRefresh();
    }, [login, logout]);

    return (
        <AuthContext.Provider value={{ 
            // isLoggedIn: true nếu (có user từ localStorage) VÀ (đã có token HOẶC đang trong lúc load/refresh)
            // Điều này giúp Header giữ trạng thái "Đã đăng nhập" ngay lập tức khi F5.
            isLoggedIn: !!user && (!!token || isAuthLoading), 
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
