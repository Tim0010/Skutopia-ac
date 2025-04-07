import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfileFormProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

const UserProfileForm = ({ isOpen, onClose, userId }: UserProfileFormProps) => {
    const { user, refreshUserProfile } = useAuth();
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        grade: "",
        current_school: "",
        city: "",
        avatar_url: "",
    });
    const [loading, setLoading] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setUploadingAvatar(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}-${Date.now()}.${fileExt}`;
            const filePath = `${userId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);
            const publicUrl = `${urlData.publicUrl}?t=${new Date().getTime()}`;

            setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
            toast.success("Avatar uploaded successfully!");
        } catch (error: any) {
            console.error("Error uploading avatar:", error);
            toast.error("Failed to upload avatar. Please try again.");
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.age || !formData.grade || !formData.current_school || !formData.city) {
            toast.error("Please fill in all required fields.");
            return;
        }
        const ageValue = parseInt(formData.age);
        if (isNaN(ageValue) || ageValue <= 0) {
            toast.error("Please enter a valid positive age.");
            return;
        }

        setLoading(true);

        try {
            console.log("Submitting profile data:", { userId, formData });

            const { error: profileError } = await supabase
                .from('user_profiles' as any)
                .upsert({
                    user_id: userId,
                    name: formData.name,
                    age: ageValue,
                    grade: formData.grade,
                    current_school: formData.current_school,
                    city: formData.city,
                    avatar_url: formData.avatar_url || null,
                    profile_completed: true,
                }, {
                    onConflict: 'user_id'
                });

            if (profileError) {
                console.error("Error saving profile:", profileError);
                throw profileError;
            }

            const updates: { data?: { name?: string; avatar_url?: string } } = { data: {} };
            let authMetaChanged = false;
            if (formData.name && formData.name !== user?.name) {
                updates.data!.name = formData.name;
                authMetaChanged = true;
            }
            if (formData.avatar_url && formData.avatar_url !== user?.avatarUrl) {
                updates.data!.avatar_url = formData.avatar_url;
                authMetaChanged = true;
            }

            if (authMetaChanged && Object.keys(updates.data!).length > 0) {
                console.log("Updating auth user metadata:", updates);
                const { error: authUserError } = await supabase.auth.updateUser(updates);
                if (authUserError) {
                    console.error("Error updating auth user:", authUserError);
                    toast.warning("Profile saved, but failed to update auth metadata.");
                }
            }

            console.log("Profile saved successfully");
            toast.success("Profile updated successfully!");

            await refreshUserProfile();

            onClose();
        } catch (error: any) {
            console.error("Error updating profile:", error);
            toast.error(`Failed to update profile: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            if (!formData.name || !formData.age || !formData.grade || !formData.current_school || !formData.city) {
                toast.info("Please complete all required fields to save your profile.");
            } else {
                onClose();
            }
        }
    };

    const isFormValid =
        !!formData.name &&
        !!formData.age &&
        !isNaN(parseInt(formData.age)) &&
        parseInt(formData.age) > 0 &&
        !!formData.grade &&
        !!formData.current_school &&
        !!formData.city;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl">Complete Your Profile</DialogTitle>
                    <DialogDescription>
                        Welcome to Skutopia Academy! Please provide these details to personalize your experience.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                    <div className="flex flex-col items-center space-y-3">
                        <div className="relative">
                            <Avatar className="w-24 h-24 border-2 border-muted">
                                <AvatarImage src={formData.avatar_url || undefined} alt="User Avatar" />
                                <AvatarFallback className="text-2xl bg-muted">
                                    {formData.name ? formData.name.slice(0, 2).toUpperCase() : <Camera className="h-8 w-8 text-muted-foreground" />}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute -bottom-1 -right-1 rounded-full h-8 w-8 bg-background border shadow-sm"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                aria-label="Change profile picture"
                            >
                                {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleAvatarUpload}
                            />
                        </div>
                        <Label htmlFor="avatar-upload-implicit" className="text-sm text-muted-foreground cursor-pointer hover:text-primary" onClick={() => fileInputRef.current?.click()}>Upload Profile Picture</Label>
                        <input id="avatar-upload-implicit" type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required placeholder="e.g., Alex Doe" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="age">Age</Label>
                            <Input id="age" name="age" type="number" min="1" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} required placeholder="e.g., 17" />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="grade">Grade</Label>
                            <Select name="grade" value={formData.grade} onValueChange={(value) => setFormData({ ...formData, grade: value })} required>
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
                            <Label htmlFor="current_school">Current School</Label>
                            <Input id="current_school" name="current_school" value={formData.current_school} onChange={(e) => setFormData({ ...formData, current_school: e.target.value })} required placeholder="e.g., Central High" />
                        </div>
                        <div className="space-y-1.5 sm:col-span-2">
                            <Label htmlFor="city">Current City</Label>
                            <Input id="city" name="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required placeholder="e.g., Nairobi" />
                        </div>
                    </div>

                    <Button type="submit" className="w-full !mt-6" disabled={!isFormValid || loading || uploadingAvatar}>
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {loading ? "Saving..." : uploadingAvatar ? "Uploading Avatar..." : "Save Profile & Continue"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UserProfileForm; 