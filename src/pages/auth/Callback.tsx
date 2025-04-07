import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const Callback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the session from the URL
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) {
                    console.error('Error getting session:', error.message);
                    navigate('/login?error=auth-failed');
                    return;
                }

                if (session) {
                    // Successful login, redirect to dashboard
                    navigate('/dashboard');
                } else {
                    // No session found, redirect to login
                    navigate('/login');
                }
            } catch (error) {
                console.error('Error in auth callback:', error);
                navigate('/login?error=auth-failed');
            }
        };

        handleAuthCallback();
    }, [navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-skutopia-600"></div>
        </div>
    );
};

export default Callback; 