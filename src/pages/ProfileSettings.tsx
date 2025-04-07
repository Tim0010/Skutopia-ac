import { useState, useEffect, ChangeEvent, FormEvent, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";

// Shadcn UI imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Loader2 } from "lucide-react";

// Define structure for form data based on UserProfile in AuthContext
interface ProfileFormData {
    name: string;
    avatarUrl?: string;
    age?: number | string; // Use string for input, convert on save
    grade?: string;
    currentSchool?: string;
    city?: string;
}

export default function ProfileSettingsPage() {
    const { user, session, loading: authLoading, refreshUserProfile, logout } = useAuth();
    const navigate = useNavigate();

    // Form state initialized from AuthContext user
    const [formData, setFormData] = useState<ProfileFormData>({
        name: "",
        avatarUrl: "",
        age: "",
        grade: "",
        currentSchool: "",
        city: "",
    });

    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialize form data when user context loads/changes
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                avatarUrl: user.avatarUrl || "",
                age: user.age?.toString() || "", // Convert number to string for input
                grade: user.grade || "",
                currentSchool: user.currentSchool || "",
                city: user.city || "",
            });
            setAvatarPreview(user.avatarUrl || null);
        }
    }, [user]);

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handle Select change specifically for grade
    const handleGradeChange = (value: string) => {
        setFormData(prev => ({ ...prev, grade: value }));
    };

    const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setAvatarFile(null);
            setAvatarPreview(user?.avatarUrl ?? null); // Revert to original user avatar
        }
    };

    const handleAvatarUpload = async () => {
        if (!avatarFile || !user?.id) return;
        setIsUploading(true);
        try {
            const fileExt = avatarFile.name.split('.').pop();
            // Ensure unique file path per user, including a timestamp or random element
            const fileName = `${user.id}-${Date.now()}.${fileExt}`;
            const filePath = `${user.id}/${fileName}`; // Store in user-specific folder

            // Upload new avatar to the 'avatars' bucket
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, avatarFile, { upsert: true }); // Use upsert to overwrite if needed
            if (uploadError) throw uploadError;

            // Get public URL (add timestamp to bust cache if needed)
            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
            const publicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;

            // Update user_profiles table
            const { error: profileUpdateError } = await supabase
                .from('user_profiles' as any) // Use 'as any' due to potential type issues
                .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
                .eq('user_id', user.id);
            if (profileUpdateError) throw profileUpdateError;

            // Update auth.users metadata as well
            const { error: authUpdateError } = await supabase.auth.updateUser({
                data: { avatar_url: publicUrl } // Ensure metadata key is correct
            });
            if (authUpdateError) {
                console.warn("Auth user avatar update failed:", authUpdateError);
                // Continue even if auth update fails, profile is updated
            }

            setFormData(prev => ({ ...prev, avatarUrl: publicUrl }));
            setAvatarPreview(publicUrl); // Update preview immediately
            setAvatarFile(null);

            await refreshUserProfile(); // Refresh context
            toast.success("Avatar updated successfully!");

        } catch (error: any) {
            console.error("Avatar upload error:", error);
            toast.error(`Failed to upload avatar: ${error.message}`);
            setAvatarPreview(user?.avatarUrl ?? null); // Revert preview on error
        } finally {
            setIsUploading(false);
        }
    };

    // Handle General Profile Update (excluding avatar)
    const handleProfileUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!user?.id) return;
        setIsSaving(true);

        // Ensure age is a number or null
        const ageValue = formData.age ? parseInt(formData.age.toString(), 10) : null;
        if (formData.age && (isNaN(ageValue!) || ageValue! <= 0)) { // Add validation
            toast.error("Please enter a valid positive number for age.");
            setIsSaving(false);
            return;
        }

        try {
            // 1. Prepare updates for user_profiles table
            const profileUpdates = {
                name: formData.name,
                age: ageValue,
                grade: formData.grade,
                current_school: formData.currentSchool,
                city: formData.city,
                updated_at: new Date().toISOString(),
                // Ensure profile is marked completed if edited here
                profile_completed: true,
            };

            const { error: profileError } = await supabase
                .from('user_profiles' as any) // Use 'as any' due to potential type issues
                .update(profileUpdates)
                .eq('user_id', user.id);

            if (profileError) {
                console.error("Error updating user_profile:", profileError);
                throw profileError; // Throw to prevent auth update if profile fails
            }

            // 2. Update auth.users metadata (only if name changed)
            if (formData.name !== user.name) {
                const { error: authError } = await supabase.auth.updateUser({
                    // Ensure the key matches your auth metadata (e.g., 'name' or 'full_name')
                    data: { name: formData.name }
                });
                if (authError) {
                    console.warn("Auth user name update failed:", authError);
                    toast.warning("Profile details saved, but failed to update auth name.");
                }
            }

            await refreshUserProfile(); // Refresh context to get latest data
            toast.success("Profile updated successfully!");

        } catch (error: any) {
            console.error("Profile update error:", error);
            toast.error(`Failed to update profile: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    // --- Handle Password Change (remains mostly the same) ---
    const handleChangePassword = async (e: FormEvent) => {
        e.preventDefault();
        setPasswordError(null);
        if (!newPassword || !confirmPassword) {
            setPasswordError("New password and confirmation are required.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }
        if (newPassword.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            return;
        }
        setIsChangingPassword(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            toast.success("Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (error: any) {
            console.error("Password update error:", error);
            setPasswordError(`Failed to update password: ${error.message}`);
            toast.error("Failed to update password.");
        } finally {
            setIsChangingPassword(false);
        }
    };

    // --- Handle Account Deletion (remains mostly the same) ---
    const handleConfirmDelete = async () => {
        if (!user?.id) return;
        setIsDeleting(true);
        try {
            // Ensure you have an RPC function 'delete_user_account' in Supabase
            // that handles deletion securely (e.g., requires auth, deletes related data)
            const { error } = await supabase.rpc('delete_user_account');
            if (error) throw error;

            toast.success("Account successfully requested for deletion. You will be logged out.");
            await logout();
            navigate("/");
        } catch (error: any) {
            console.error("Account deletion error:", error);
            toast.error(`Failed to delete account: ${error.message || 'Unknown error'}`);
            setIsDeleting(false);
        }
    };

    if (authLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }
    if (!user) {
        return <div className="p-6 text-center">Please log in to view your profile settings.</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-4xl">
            <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

            {/* Profile Information Card */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details and avatar.</CardDescription>
                </CardHeader>
                <form onSubmit={handleProfileUpdate}>
                    <CardContent className="space-y-6 pt-6">
                        {/* Avatar Section */}
                        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                            <div className="relative flex-shrink-0">
                                <Avatar className="w-24 h-24 border">
                                    <AvatarImage src={avatarPreview ?? undefined} alt={`${formData.name}'s avatar`} />
                                    <AvatarFallback className="text-xl">{formData.name?.slice(0, 2).toUpperCase() || '??'}</AvatarFallback>
                                </Avatar>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 bg-background border shadow-sm"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    aria-label="Change profile picture"
                                >
                                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                                </Button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/png, image/jpeg, image/webp"
                                    onChange={handleAvatarChange}
                                />
                            </div>
                            <div className="flex-grow text-center sm:text-left">
                                <Label htmlFor="avatar-upload-button" className="text-sm font-medium">Profile Picture</Label>
                                <p className="text-sm text-muted-foreground mb-2">Upload a new avatar (PNG, JPG, WEBP).</p>
                                {avatarFile && (
                                    <Button
                                        id="avatar-upload-button"
                                        type="button"
                                        size="sm"
                                        onClick={handleAvatarUpload}
                                        disabled={isUploading}
                                        className="mt-1"
                                    >
                                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                        {isUploading ? 'Uploading...' : 'Upload New Avatar'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Form Fields Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="name">Name</Label>
                                <Input id="name" name="name" type="text" value={formData.name} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="age">Age</Label>
                                <Input id="age" name="age" type="number" min="1" value={formData.age} onChange={handleInputChange} placeholder="e.g., 16" />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="grade">Grade</Label>
                                <Select name="grade" value={formData.grade} onValueChange={handleGradeChange}>
                                    <SelectTrigger id="grade">
                                        <SelectValue placeholder="Select your grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="grade-8">Grade 8</SelectItem>
                                        <SelectItem value="grade-9">Grade 9</SelectItem>
                                        <SelectItem value="grade-10">Grade 10</SelectItem>
                                        <SelectItem value="grade-11">Grade 11</SelectItem>
                                        <SelectItem value="grade-12">Grade 12</SelectItem>
                                        <SelectItem value="university">University</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="currentSchool">Current School</Label>
                                <Input id="currentSchool" name="currentSchool" type="text" value={formData.currentSchool} onChange={handleInputChange} placeholder="e.g., Skutopia High" />
                            </div>
                            <div className="space-y-1.5 md:col-span-2">
                                <Label htmlFor="city">Current City</Label>
                                <Input id="city" name="city" type="text" value={formData.city} onChange={handleInputChange} placeholder="e.g., Nairobi" />
                            </div>
                            {/* Add bio, phone, location inputs here if needed */}
                        </div>
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                        <Button type="submit" disabled={isSaving || isUploading}>
                            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isSaving ? 'Saving...' : 'Save Profile Changes'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {/* Change Password Card */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle>Change Password</CardTitle>
                    <CardDescription>Update your account password. Leave blank if you do not wish to change it.</CardDescription>
                </CardHeader>
                <form onSubmit={handleChangePassword}>
                    <CardContent className="space-y-4 pt-6">
                        {/* Add Current Password field if backend requires it for verification */}
                        {/* <div className="space-y-1.5">
                             <Label htmlFor="currentPassword">Current Password</Label>
                             <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required />
                         </div> */}
                        <div className="space-y-1.5">
                            <Label htmlFor="newPassword">New Password (min. 6 characters)</Label>
                            <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                        </div>
                        {passwordError && <p className="text-sm text-red-600 dark:text-red-500">{passwordError}</p>}
                    </CardContent>
                    <CardFooter className="border-t pt-6">
                        <Button type="submit" disabled={isChangingPassword}>
                            {isChangingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            {isChangingPassword ? 'Updating...' : 'Change Password'}
                        </Button>
                    </CardFooter>
                </form>
            </Card>

            {/* Danger Zone Card */}
            <Card className="border-destructive">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Manage potentially destructive actions.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                Delete Account
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your account
                                    and remove your data from our servers.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleConfirmDelete}
                                    disabled={isDeleting}
                                    className="bg-destructive hover:bg-destructive/90"
                                >
                                    {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </CardContent>
            </Card>
        </div>
    );
}
