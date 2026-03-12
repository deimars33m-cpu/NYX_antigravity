import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ProtectedRoute = () => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                setAuthenticated(!!session);
            } catch (error) {
                console.error("Error checking auth:", error);
                setAuthenticated(false);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setAuthenticated(!!session);
            setLoading(false);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!authenticated) {
        return <Navigate to="/auth" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
