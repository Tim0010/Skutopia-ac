import React, { useState, useEffect } from 'react';
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
    Edit, 
    Trash2, 
    Plus, 
    Search, 
    Eye // For viewing/building the quiz
} from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom'; // To navigate to the builder
import { getQuizzes, deleteQuiz, getQuizById } from '@/services/quizService';
import QuizFormModal from '@/components/admin/QuizFormModal'; // Import the modal

// Use the Supabase Row type for quizzes list
import { Database } from '@/types/database.types';
type DbQuiz = Database['public']['Tables']['quizzes']['Row'];

const AdminQuizzes = () => {
    const [quizzes, setQuizzes] = useState<DbQuiz[]>([]); // Use DbQuiz[]
    const [loading, setLoading] = useState(true);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [quizToDelete, setQuizToDelete] = useState<DbQuiz | null>(null); // Use DbQuiz
    const navigate = useNavigate();

    // State for the Add/Edit Modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState<DbQuiz | null>(null);

    useEffect(() => {
        fetchQuizList();
    }, []);

    const fetchQuizList = async () => {
        setLoading(true);
        try {            
            const data = await getQuizzes(); // Fetches DbQuiz[]
            // TODO: Fetch question counts separately if needed for display
            // const quizzesWithCounts = await Promise.all(data.map(async (q) => {
            //     const count = await getQuestionCountForQuiz(q.id); // Need to implement this service fn
            //     return { ...q, question_count: count }; 
            // }));
            setQuizzes(data); 
        } catch (error) {
            toast.error("Failed to load quizzes.");
        } finally {
            setLoading(false);
        }
    };

    const handleAddQuiz = () => {
        setEditingQuiz(null); // Ensure no initial data for adding
        setIsModalOpen(true);
    };

    const handleEditQuiz = (quiz: DbQuiz) => {
        // The list already has the DbQuiz object, so we can pass it directly
        setEditingQuiz(quiz);
        setIsModalOpen(true);
        // If list only had partial data, you might fetch full data here first:
        // const fullQuizData = await getQuizById(quiz.id);
        // setEditingQuiz(fullQuizData);
        // setIsModalOpen(true);
    };

    const handleBuildQuiz = (quizId: string) => {
        navigate(`/admin/quiz-builder/${quizId}`); // Navigate to the builder page
    };

    const openDeleteDialog = (quiz: DbQuiz) => {
        setQuizToDelete(quiz);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteQuiz = async () => {
        if (!quizToDelete) return;
        
        setLoading(true); // Indicate loading state during delete
        const success = await deleteQuiz(quizToDelete.id);
        if (success) {
            setQuizzes(prev => prev.filter(q => q.id !== quizToDelete.id));
            toast.success(`Quiz "${quizToDelete.title}" deleted.`);
        } else {
            // Error toast is handled within deleteQuiz service function
        }
        setIsDeleteDialogOpen(false);
        setQuizToDelete(null);
        setLoading(false);
    };

    // Callback function for the modal save
    const handleSaveQuiz = (savedQuiz: DbQuiz) => {
        setQuizzes(prevQuizzes => {
            const index = prevQuizzes.findIndex(q => q.id === savedQuiz.id);
            if (index !== -1) {
                // Update existing quiz in the list
                const updatedQuizzes = [...prevQuizzes];
                updatedQuizzes[index] = savedQuiz;
                return updatedQuizzes;
            } else {
                // Add new quiz to the list
                return [...prevQuizzes, savedQuiz];
            }
        });
        setIsModalOpen(false); // Close modal after save
    };

    if (loading && quizzes.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Manage Quizzes</h1>
                    <p className="text-muted-foreground mt-1">Create, edit, and build quizzes</p>
                </div>
                <Button onClick={handleAddQuiz} className="mt-4 sm:mt-0">
                    <Plus size={18} className="mr-2" />
                    Add New Quiz
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quiz List</CardTitle>
                    <CardDescription>All available quizzes</CardDescription>
                    {/* TODO: Add Search/Filter inputs here if needed */}
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Grade</TableHead>
                                {/* <TableHead>Tutor</TableHead> */} 
                                <TableHead>Questions</TableHead>
                                <TableHead>Time Limit (min)</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Subject</TableHead> {/* Added Subject */} 
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && quizzes.length > 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center">
                                        Updating...
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && quizzes.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                                        No quizzes found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
                            {!loading && quizzes.map((quiz) => (
                                <TableRow key={quiz.id}>
                                    <TableCell className="font-medium">{quiz.title || 'Untitled'}</TableCell>
                                    <TableCell>{quiz.grade || 'N/A'}</TableCell>
                                    <TableCell>{quiz.subject || 'N/A'}</TableCell>
                                    <TableCell>{quiz.time_limit_minutes !== null ? `${quiz.time_limit_minutes} minutes` : 'N/A'}</TableCell>
                                    <TableCell>{new Date(quiz.created_at).toLocaleDateString()}</TableCell>
                                    <TableCell>{quiz.subject || 'N/A'}</TableCell> {/* Display Subject */}
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="outline" size="icon" onClick={() => handleBuildQuiz(quiz.id)} title="Build Quiz">
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="icon" onClick={() => handleEditQuiz(quiz)} title="Edit Details">
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="destructive" size="icon" onClick={() => openDeleteDialog(quiz)} title="Delete Quiz">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            {isDeleteDialogOpen && quizToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Delete Quiz</CardTitle>
                            <CardDescription>Are you sure you want to delete the quiz "{quizToDelete.title}"? This action cannot be undone.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex justify-end space-x-2">
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={confirmDeleteQuiz} disabled={loading}>
                                {loading ? 'Deleting...' : 'Delete'}
                            </Button>
                        </CardContent>
                    </Card>
                 </div>
            )}

            {/* Add/Edit Quiz Modal */} 
            <QuizFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveQuiz}
                initialData={editingQuiz}
            />
        </div>
    );
};

export default AdminQuizzes;
