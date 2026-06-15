import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode, useMemo } from 'react';
import { getToken, setToken } from '../utils/authUtils';
import authApi from '../api/authApi';

interface User {
    username: string;
    role: string;
}

interface AuthStateContextType {
    isLoggedIn: boolean;
    user: User | null;
    isAuthLoading: boolean;
}

interface AuthDispatchContextType {
    login: (token: string, username: string, role: string) => void;
    logout: () => void;
    setIsAuthLoading: (loading: boolean) => void;
}

const AuthStateContext = createContext<AuthStateContextType | undefined>(undefined);
const AuthDispatchContext = createContext<AuthDispatchContextType | undefined>(undefined);

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
                } else {
                    // Nếu response về không như mong đợi -> logout sạch sẽ
                    logout();
                }
            } catch (error: any) {
                console.error("Initial recovery failed", error);
                // CHỈ logout nếu là lỗi Auth (400, 401, 403)
                // Nếu là lỗi mạng (502, 503, hoặc bị browser block Mixed Content) 
                // thì KHÔNG logout để giữ lại username/role cho người dùng thấy "cái tên" của mình.
                const status = error.response?.status;
                if (status === 401 || status === 400 || status === 403) {
                    logout();
                }
            } finally {
                setIsAuthLoading(false);
            }
        };

        silentRefresh();
    }, [login, logout]);

    const authStateValue = useMemo(() => ({
        isLoggedIn: !!user && (!!token || isAuthLoading),
        user,
        isAuthLoading,
    }), [user, token, isAuthLoading]);

    const authDispatchValue = useMemo(() => ({
        login,
        logout,
        setIsAuthLoading
    }), [login, logout]);

    return (
        <AuthStateContext.Provider value={authStateValue}>
            <AuthDispatchContext.Provider value={authDispatchValue}>
                {children}
            </AuthDispatchContext.Provider>
        </AuthStateContext.Provider>
    );
};

export const useAuthState = () => {
    const context = useContext(AuthStateContext);
    if (!context) {
        throw new Error('useAuthState phải được dùng trong AuthProvider');
    }
    return context;
};

export const useAuthDispatch = () => {
    const context = useContext(AuthDispatchContext);
    if (!context) {
        throw new Error('useAuthDispatch phải được dùng trong AuthProvider');
    }
    return context;
};
