import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Using react-router-dom
import { useAuth } from '@/contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import { supabase } from '@/lib/supabaseClient'; // Corrected import name

// Shadcn UI imports (replace as needed)
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from '@/components/ui/button';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';
import { fetchUserProfile } from '@/data/userService';

export default function UserDropdown() {
    const { user, session, loading } = useAuth();
    const navigate = useNavigate();
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
    const [userName, setUserName] = useState<string>('User');

    // Refetch profile specifically for avatar/name if needed, or rely on useAuth
    useEffect(() => {
        if (user?.id) {
            // Option 1: Rely on session data (might be slightly stale)
            setAvatarUrl(session?.user?.user_metadata?.avatar_url);
            setUserName(session?.user?.user_metadata?.full_name ?? session?.user?.email ?? 'User');

            // Option 2: Fetch latest profile (more up-to-date but extra request)
            // fetchUserProfile(user.id).then(profile => {
            //     if (profile) {
            //         setAvatarUrl(profile.avatar_url);
            //         setUserName(profile.name ?? session?.user?.email ?? 'User');
            //     }
            // });
        }
    }, [user, session]); // Rerun when user or session changes

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error("Error logging out:", error);
            // Add user feedback (toast)
        } else {
            navigate('/'); // Redirect to home or login page after logout
            // State should clear via useAuth
        }
    };

    if (loading) {
        return <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>; // Placeholder
    }

    if (!user) {
        return (
            <Link to="/login">
                <Button variant="outline">Login</Button>
            </Link>
        );
    }

    // Get fallback initial
    const fallbackInitial = userName?.charAt(0).toUpperCase() ?? 'U';

    return (
        <div className="flex items-center gap-4">
            <ThemeToggle /> 
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <Avatar className="h-10 w-10">
                            <AvatarImage src={avatarUrl ?? undefined} alt={userName} />
                            <AvatarFallback>{fallbackInitial}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{userName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                        <Link to="/profile-settings" className="flex items-center cursor-pointer">
                             <UserIcon className="mr-2 h-4 w-4" />
                             <span>Profile</span>
                        </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild>
                        {/* Link to general settings if you create one, otherwise remove or point to profile */}
                         <Link to="/profile-settings" className="flex items-center cursor-pointer">
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="flex items-center cursor-pointer">
                         <LogOut className="mr-2 h-4 w-4" />
                         <span>Log out</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
