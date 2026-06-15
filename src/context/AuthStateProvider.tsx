interface User {
    username: string;
    role: string;
}

interface AuthStateContextType {
    isLoggedIn: boolean;
    user: User | null;
    isAuthLoading: boolean;
}

export const AuthStateProvider = (): React.FC<AuthStateContextType> => {

    return (
        <Context.Provider value={{ isLoggedIn, user, isAuthLoading }}>

        </Context.Provider>
}