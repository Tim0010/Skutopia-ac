import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Quiz, createQuiz, updateQuiz } from '@/services/quizService';

// Use Supabase Row type directly for the form data structure
import { Database } from '@/types/database.types';
type DbQuiz = Database['public']['Tables']['quizzes']['Row'];
// Pick only the fields needed for the form
type QuizFormData = Pick<
    DbQuiz, 
    'title' | 'description' | 'grade' | 'subject' | 'time_limit_minutes'
> & { id?: string }; // Add optional id for updates

interface QuizFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (quiz: DbQuiz) => void; // Callback with the full DbQuiz object after save
    initialData?: DbQuiz | null; // Pass the full DbQuiz for editing
}

const QuizFormModal: React.FC<QuizFormModalProps> = ({ 
    isOpen, 
    onClose, 
    onSave, 
    initialData 
}) => {
    const [formData, setFormData] = useState<QuizFormData>({
        title: '',
        description: '',
        subject: '',
        grade: '',
        time_limit_minutes: null
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            // Populate form with initial data if editing
            setFormData({
                id: initialData.id,
                title: initialData.title ?? '',
                description: initialData.description ?? '',
                grade: initialData.grade ?? '',
                subject: initialData.subject ?? '',
                time_limit_minutes: initialData.time_limit_minutes ?? null
            });
        } else {
            // Reset form if adding
            setFormData({
                title: '',
                description: '',
                subject: '',
                grade: '',
                time_limit_minutes: null
            });
        }
    }, [initialData, isOpen]); // Reset form when modal opens or initialData changes

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'time_limit_minutes' ? (value ? parseInt(value, 10) : null) : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Basic validation
        if (!formData.title || !formData.grade || !formData.subject) {
            toast.error("Title, Grade, and Subject are required.");
            setLoading(false);
            return;
        }

        try {
            let savedQuiz: DbQuiz | null = null;
            if (formData.id) {
                // Update existing quiz (ensure only updateable fields are sent)
                const updateData: Partial<DbQuiz> = {
                    title: formData.title,
                    description: formData.description,
                    grade: formData.grade,
                    subject: formData.subject,
                    time_limit_minutes: formData.time_limit_minutes,
                };
                savedQuiz = await updateQuiz(formData.id, updateData);
            } else {
                // Create new quiz (ensure all required non-nullable fields are present)
                 const createData: Omit<DbQuiz, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'tutor_id'> & { created_by: string, tutor_id?: string | null } = {
                    title: formData.title,
                    description: formData.description,
                    grade: formData.grade,
                    subject: formData.subject,
                    time_limit_minutes: formData.time_limit_minutes,
                    // TODO: Get actual user ID for created_by
                    // For now, using a placeholder. Replace with actual logged-in user ID.
                    created_by: 'placeholder-user-id', 
                     // TODO: Add tutor selection if required
                    tutor_id: null 
                };
                savedQuiz = await createQuiz(createData as any); // Needs type assertion potentially
            }

            if (savedQuiz) {
                toast.success(`Quiz "${savedQuiz.title}" ${formData.id ? 'updated' : 'created'} successfully!`);
                onSave(savedQuiz); // Pass the saved quiz back
                onClose(); // Close modal on success
            } 
            // Error handling is likely done within create/updateQuiz service functions
            
        } catch (error) {
            // Redundant error toast if service handles it, but good as a fallback
            toast.error("An error occurred while saving the quiz.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{initialData ? 'Edit Quiz Details' : 'Add New Quiz'}</DialogTitle>
                    <DialogDescription>
                        {initialData ? 'Update the details for this quiz.' : 'Fill in the details for the new quiz.'}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Title
                            </Label>
                            <Input 
                                id="title" 
                                name="title" 
                                value={formData.title || ''} 
                                onChange={handleChange} 
                                className="col-span-3" 
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="subject" className="text-right">
                                Subject
                            </Label>
                            <Input 
                                id="subject" 
                                name="subject" 
                                value={formData.subject || ''} 
                                onChange={handleChange} 
                                className="col-span-3" 
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="grade" className="text-right">
                                Grade
                            </Label>
                            <Input 
                                id="grade" 
                                name="grade" 
                                value={formData.grade || ''} 
                                onChange={handleChange} 
                                className="col-span-3" 
                                required 
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="time_limit_minutes" className="text-right">
                                Time (min)
                            </Label>
                            <Input 
                                id="time_limit_minutes" 
                                name="time_limit_minutes" 
                                type="number" 
                                value={formData.time_limit_minutes ?? ''} 
                                onChange={handleChange} 
                                className="col-span-3" 
                                min="1"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea 
                                id="description" 
                                name="description" 
                                value={formData.description || ''} 
                                onChange={handleChange} 
                                className="col-span-3" 
                                rows={3} 
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Quiz'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default QuizFormModal;
