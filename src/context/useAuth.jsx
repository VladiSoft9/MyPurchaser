import { createContext, useContext, useState, useEffect } from "react";
import supabase from "../services/supabaseClient";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
    const [session, setSession] = useState(null);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);   

    useEffect(() => {

        supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => {
            authListener.subscription.unsubscribe();
        };  
    }, []);

    const signUp = (email, password) =>
        supabase.auth.signUp({ email, password });

    const signIn = (email, password) =>
        supabase.auth.signInWithPassword({ email, password });

    const signOut = () =>
        supabase.auth.signOut();

    return (
        <AuthContext.Provider value={{ session, user, loading, signUp, signIn, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

export { AuthProvider, useAuth };