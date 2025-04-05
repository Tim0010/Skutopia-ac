import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { updateTheme, fetchUserProfile } from "@/data/userService";
import { Moon, Sun } from "lucide-react"; // Using lucide icons
import { Button } from "@/components/ui/button"; // Assuming shadcn Button

type Theme = 'light' | 'dark';

export default function ThemeToggle() {
    const { user, loading: authLoading } = useAuth();
    // Initialize theme based on system preference or saved preference
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme') as Theme | null;
            if (savedTheme) return savedTheme;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light'; // Default for server-side rendering
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Effect to apply theme class to HTML element and save to localStorage
    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Effect to fetch and set theme from user profile when logged in
    useEffect(() => {
        let isMounted = true;
        async function loadUserTheme() {
            if (user?.id) {
                setIsLoading(true);
                try {
                    const profile = await fetchUserProfile(user.id);
                    if (isMounted && profile?.theme) {
                        setTheme(profile.theme);
                    }
                } catch (error) {
                    console.error("Failed to fetch user theme:", error);
                    // Keep local/system theme if fetch fails
                } finally {
                    if (isMounted) setIsLoading(false);
                }
            } else {
                 setIsLoading(false); // No user logged in
            }
        }

        if (!authLoading) {
             loadUserTheme();
        }

        return () => { isMounted = false; };
    }, [user, authLoading]);

    const handleToggle = async () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);

        // Update theme in DB if user is logged in
        if (user?.id) {
            try {
                await updateTheme(user.id, newTheme);
            } catch (error) {
                console.error("Failed to update theme preference in DB:", error);
                // Optional: revert UI state or show toast?
            }
        }
    };

    if (authLoading || isLoading) {
        return <Button variant="ghost" size="icon" disabled><Sun className="h-[1.2rem] w-[1.2rem]" /></Button>; // Placeholder while loading
    }

    return (
        <Button variant="ghost" size="icon" onClick={handleToggle} aria-label="Toggle theme">
            {theme === 'light' ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
        </Button>
    );
}
