import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import PublicLayout from '@/components/PublicLayout';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertCircle, Loader2, FileText, Eye, X, LogIn, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';

// Interface matching the database table structure
interface StudyMaterial {
  id: number;
  title: string;
  description?: string;
  subject?: string;
  grade_level?: number;
  file_path: string;
  preview_image_path?: string;
  created_at: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

// --- Helper to get public image URL ---
const getPublicImageUrl = (path: string | undefined | null): string | null => {
  if (!path) return null;
  // Use import.meta.env for Vite projects
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  // Check if the environment variable is actually set
  if (!supabaseUrl) {
    console.error('VITE_SUPABASE_URL environment variable is not set. Cannot display preview images.');
    return null;
  }
  // Assumes a public bucket named 'material-previews'
  return `${supabaseUrl}/storage/v1/object/public/material-previews/${path}`;
};
// --- End Helper ---

export default function StudyMaterials() {
  const { user, loading: authLoading } = useAuth();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState<string | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [selectedMaterialTitle, setSelectedMaterialTitle] = useState('');
  const initialActionChecked = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMaterials = async () => {
      setMaterials([]);
      setLoading(true);
      setError(null);
      try {
        const { data, error: dbError } = await supabase
          .from('study_materials')
          .select('*')
          .order('created_at', { ascending: false });

        if (dbError) throw dbError;
        setMaterials(data || []);
      } catch (err: any) {
        console.error("Error fetching study materials:", err);
        setError("Failed to load study materials. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  useEffect(() => {
    if (!initialActionChecked.current && !loading && !authLoading && materials.length > 0 && user) {
      const action = sessionStorage.getItem('postLoginAction');
      const redirectPath = sessionStorage.getItem('postLoginRedirect');

      if (action && redirectPath === '/study-materials' && action.startsWith('viewMaterial:')) {
        const filePath = action.split(':')[1];
        const materialToView = materials.find(m => m.file_path === filePath);

        if (materialToView) {
          console.log('Post-login action: Viewing material', filePath);
          handleViewPdf(materialToView);
        }
        sessionStorage.removeItem('postLoginAction');
        sessionStorage.removeItem('postLoginRedirect');
      }
      initialActionChecked.current = true;
    }
  }, [loading, authLoading, materials, user]);

  const handleViewPdf = async (material: StudyMaterial) => {
    if (!user) {
      sessionStorage.setItem('postLoginRedirect', '/study-materials');
      sessionStorage.setItem('postLoginAction', `viewMaterial:${material.file_path}`);
      setIsLoginPromptOpen(true);
      return;
    }

    if (!material.file_path) {
      toast.error("Invalid file path for this material.");
      return;
    }

    setIsPdfLoading(true);
    setSelectedPdfUrl(null);
    setSelectedMaterialTitle(material.title);
    setIsPdfModalOpen(true);

    console.log("Attempting to sign URL for path:", material.file_path);

    try {
      const { data, error: urlError } = await supabase
        .storage
        .from('study-materials')
        .createSignedUrl(material.file_path, 300);

      if (urlError) throw urlError;

      if (data?.signedUrl) {
        // Append #toolbar=0 to the URL to attempt hiding the viewer's default toolbar
        const urlWithOptions = `${data.signedUrl}#toolbar=0`;
        setSelectedPdfUrl(urlWithOptions);
      } else {
        throw new Error("Could not generate viewing URL.");
      }
    } catch (err: any) {
      console.error("Error creating signed URL:", err);
      toast.error(`Failed to load PDF: ${err.message}`);
      setIsPdfModalOpen(false);
    } finally {
      setIsPdfLoading(false);
    }
  };

  const renderContent = () => {
    if (loading || authLoading && !materials.length) {
      return <div className="flex justify-center items-center py-20"><Loader2 className="h-8 w-8 animate-spin text-skutopia-600" /></div>;
    }

    if (error) {
      return <div className="text-center py-10 text-red-600">{error}</div>;
    }

    if (!loading && materials.length === 0) {
      return <div className="text-center py-10 text-gray-500">No study materials found. Add some study materials to the database and Supabase storage.</div>;
    }

    return (
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {materials.map((material) => {
          const imageUrl = getPublicImageUrl(material.preview_image_path);
          return (
            <motion.div key={material.id} variants={itemVariants}>
              <Card className="h-full flex flex-col dark:bg-gray-800/50 border dark:border-gray-700/50 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={`Preview for ${material.title}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <ImageOff className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  )}
                </div>
                <div className="p-4 flex flex-col flex-grow">
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-base font-semibold dark:text-white flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-skutopia-600 dark:text-skutopia-400 flex-shrink-0" />
                      {material.title}
                    </CardTitle>
                    {material.description && (
                      <CardDescription className="text-xs pt-1">{material.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="p-0 text-xs space-y-1 text-gray-500 dark:text-gray-400 flex-grow">
                    {material.subject && <div><strong>Subject:</strong> {material.subject}</div>}
                    {material.grade_level && <div><strong>Grade:</strong> {material.grade_level}</div>}
                  </CardContent>
                  <CardFooter className="p-0 pt-4 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full dark:border-skutopia-600 dark:text-skutopia-400 dark:hover:bg-skutopia-900/50 dark:hover:text-skutopia-300"
                      onClick={() => handleViewPdf(material)}
                    >
                      <Eye className="h-4 w-4 mr-2" /> View Material
                    </Button>
                  </CardFooter>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <PublicLayout
      title="Study Materials"
      subtitle="Access learning resources, notes, and guides."
    >
      {renderContent()}

      <Dialog open={isPdfModalOpen} onOpenChange={setIsPdfModalOpen}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0">
          <DialogHeader className="p-4 border-b dark:border-gray-700">
            <DialogTitle>{selectedMaterialTitle || 'View Document'}</DialogTitle>
            <DialogDescription className="sr-only">
              Displays the selected study material PDF: {selectedMaterialTitle}
            </DialogDescription>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="absolute right-4 top-3">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </DialogClose>
          </DialogHeader>
          <div className="flex-grow p-1 overflow-hidden">
            {isPdfLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-skutopia-600" />
              </div>
            ) : selectedPdfUrl ? (
              <iframe
                src={selectedPdfUrl}
                title={selectedMaterialTitle || 'PDF Viewer'}
                className="w-full h-full border-0"
              />
            ) : (
              <div className="flex justify-center items-center h-full text-red-500">Failed to load PDF URL.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isLoginPromptOpen} onOpenChange={setIsLoginPromptOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <LogIn className="h-5 w-5 mr-2 text-skutopia-600" /> Access Required
            </DialogTitle>
            <DialogDescription>
              Please log in or sign up to view the study materials.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:justify-center mt-4">
            <Button asChild variant="outline" onClick={() => setIsLoginPromptOpen(false)}>
              <Link to="/login">Log In</Link>
            </Button>
            <Button asChild onClick={() => setIsLoginPromptOpen(false)} className="bg-skutopia-600 hover:bg-skutopia-700">
              <Link to="/signup">Sign Up</Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}
