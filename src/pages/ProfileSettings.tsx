import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useAuth } from "@/contexts/AuthContext"; // Assuming useAuth provides user and maybe refresh mechanism
import { fetchUserProfile, updateUserProfile, uploadAvatar, UserProfile } from "@/data/userService";
import { supabase } from "@/lib/supabaseClient"; // Direct import for session

// Shadcn UI imports (replace with your actual UI library components)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"; // Import AlertDialog components
import { toast } from "sonner"; // Assuming you use sonner for toasts
import { useNavigate } from "react-router-dom"; // Import useNavigate for redirection

export default function ProfileSettingsPage() {
    const { user, session, loading: authLoading, refreshUserProfile, logout } = useAuth(); // Get user and session, add logout
    const navigate = useNavigate(); // Initialize navigate
    const [profile, setProfile] = useState<Partial<UserProfile>>({}); // Store editable profile fields
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false); // State for deletion loading

    // Fetch profile data when user is available
    useEffect(() => {
        let isMounted = true;
        async function loadProfile() {
            if (user?.id) {
                setIsLoading(true);
                try {
                    const fetchedProfile = await fetchUserProfile(user.id);
                    if (isMounted && fetchedProfile) {
                        // Populate state with existing data
                        setProfile({
                            name: fetchedProfile.name ?? session?.user.user_metadata.full_name ?? '', // Get name from profile or metadata
                            bio: fetchedProfile.bio ?? '',
                            phone: fetchedProfile.phone ?? '',
                            location: fetchedProfile.location ?? '',
                            avatar_url: fetchedProfile.avatar_url ?? ''
                        });
                        setAvatarPreview(fetchedProfile.avatar_url ?? null);
                    } else if (isMounted && !fetchedProfile) {
                         // Initialize with empty strings if no profile found yet
                         setProfile({
                            name: session?.user.user_metadata.full_name ?? '',
                            bio: '',
                            phone: '',
                            location: '',
                            avatar_url: ''
                        });
                         setAvatarPreview(null);
                    }
                } catch (error) {
                    console.error("Failed to fetch profile:", error);
                    toast.error("Failed to load profile information.");
                } finally {
                    if (isMounted) setIsLoading(false);
                }
            }
        }

        if (!authLoading && user) {
            loadProfile();
        } else if (!authLoading && !user) {
            setIsLoading(false); // Not logged in
        }

        return () => { isMounted = false; };
    }, [user, authLoading, session]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleProfileUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        setIsSaving(true);
        try {
            // Prepare only the fields we want to update
            const updates: Partial<UserProfile> = {
                name: profile.name, // Assuming name is stored/updated in your profile table
                bio: profile.bio,
                phone: profile.phone,
                location: profile.location,
            };
            // If name is primarily from auth.users.user_metadata, update it separately
            if (profile.name !== session?.user.user_metadata.full_name) {
                const { error: metaError } = await supabase.auth.updateUser({
                    data: { full_name: profile.name }
                });
                if (metaError) throw metaError;
                // Maybe trigger a session refresh in useAuth here
            }

            await updateUserProfile(user.id, updates);
            toast.success("Profile updated successfully!");
        } catch (error: any) {
            console.error("Profile update error:", error);
            toast.error(`Failed to update profile: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            // Create a preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatarFile(null);
            setAvatarPreview(profile.avatar_url ?? null); // Revert to original if no file selected
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile || !user?.id) return;
        setIsUploading(true);
        try {
            const newAvatarUrl = await uploadAvatar(user.id, avatarFile);
            setProfile((prev) => ({ ...prev, avatar_url: newAvatarUrl }));
            setAvatarPreview(newAvatarUrl);
            setAvatarFile(null);

            // Refresh the user profile in the AuthContext
            await refreshUserProfile();

            toast.success("Avatar updated successfully!");
        } catch (error: any) {
            console.error("Avatar upload error:", error);
            toast.error(`Failed to upload avatar: ${error.message}`);
            // Revert preview using the profile state *before* the attempted upload
            setAvatarPreview(profile?.avatar_url ?? null);
        } finally {
            setIsUploading(false);
        }
    };

    // Handle Account Deletion
    const handleConfirmDelete = async () => {
        if (!user?.id) return;
        setIsDeleting(true);
        try {
            // --- TODO: Implement Backend Deletion Logic --- \
            // This needs a secure backend function (e.g., Supabase Edge Function)
            // to call supabase.auth.admin.deleteUser(user.id)
            console.warn(
                "Account deletion requested for user:",
                user.id,
                "Backend function not implemented yet."
            );
            // Simulating deletion for now:
            await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate network delay

            // --- End TODO ---

            toast.success("Account deleted successfully.");
            await logout(); // Log the user out
            navigate("/"); // Redirect to homepage
        } catch (error: any) {
            console.error("Account deletion error:", error);
            toast.error(`Failed to delete account: ${error.message}`);
            setIsDeleting(false);
        } 
        // No finally block to set isDeleting to false, as successful deletion logs out/redirects
    };

    // Render loading state
    if (authLoading || isLoading) {
        return <div className="p-6">Loading profile settings...</div>; // Add a spinner maybe
    }

    // Render not logged in state
    if (!user) {
        return <div className="p-6">Please log in to view your profile settings.</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-3xl">
            <h1 className="text-3xl font-bold mb-6">Account Settings</h1>

            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details.</CardDescription>
                </CardHeader>
                <form onSubmit={handleProfileUpdate}>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                type="text"
                                value={profile?.name ?? ''}
                                onChange={handleInputChange}
                                placeholder="Your Name"
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                name="bio"
                                value={profile?.bio ?? ''}
                                onChange={handleInputChange}
                                placeholder="Tell us a bit about yourself"
                                rows={3}
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                                id="phone"
                                name="phone"
                                type="tel" // Use tel type for phones
                                value={profile?.phone ?? ''}
                                onChange={handleInputChange}
                                placeholder="+1 234 567 890"
                                disabled={isSaving}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                type="text"
                                value={profile?.location ?? ''}
                                onChange={handleInputChange}
                                placeholder="City, Country"
                                disabled={isSaving}
                            />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Profile Picture</CardTitle>
                    <CardDescription>Upload or change your avatar.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center space-y-4">
                    <Avatar className="w-24 h-24">
                        <AvatarImage src={avatarPreview ?? undefined} alt={profile?.name ?? "User Avatar"} />
                        <AvatarFallback>{profile?.name?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-2 w-full max-w-xs">
                        <Label htmlFor="avatarFile">Choose new avatar</Label>
                        <Input
                            id="avatarFile"
                            type="file"
                            accept="image/png, image/jpeg, image/gif" // Accept common image types
                            onChange={handleAvatarChange}
                            disabled={isUploading}
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleAvatarUpload} disabled={!avatarFile || isUploading}>
                        {isUploading ? "Uploading..." : "Upload Avatar"}
                    </Button>
                </CardFooter>
            </Card>

            {/* --- Danger Zone: Account Deletion --- */}
            <Card className="border-destructive mt-6">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Permanently delete your account and all associated data. This action
                        cannot be undone.
                    </CardDescription>
                </CardHeader>
                <CardFooter>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                {isDeleting ? "Deleting..." : "Delete Account"}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    account and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    {isDeleting ? "Deleting..." : "Yes, delete account"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardFooter>
            </Card>
        </div>
    );
}
