import { useEffect, useState } from "react";
import supabase from "../services/supabaseClient";
import { useAuth } from '../context/useAuth';
import { Link, useNavigate } from 'react-router-dom';

function App() {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (<div>
        <h1>MyPurchaser</h1>
        <p>Welcome to your personal Purchasing Assistant.</p>
        <button onClick={handleSignOut}>Sign Out</button>
    </div>
    );
}

export default App;