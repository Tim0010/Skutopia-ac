import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, FileText, Search, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";

// Define PastPaper interface
export interface PastPaper {
  id: string; // UUID
  title: string;
  subject: string;
  year: number;
  grade: number | null; // Or string if needed
  file_path: string; // Relative path in storage
  file_size_kb: number | null; // Optional file size
  created_at: string;
}

/* // Commenting out Sample past papers data
const pastPapersData = [
 // ... all sample data ...
];
*/

const PastPapers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedGrade, setSelectedGrade] = useState("All Grades");

  // State for fetched papers, loading, and errors
  const [papers, setPapers] = useState<PastPaper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for filter options
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [availableGrades, setAvailableGrades] = useState<string[]>([]);
  const [loadingFilters, setLoadingFilters] = useState<boolean>(true);

  // Fetch distinct filter values on mount
  useEffect(() => {
    const fetchFilterOptions = async () => {
      setLoadingFilters(true);
      try {
        // Assuming 'subject', 'year', 'grade' are column names in 'past_papers'
        const [subjectsRes, yearsRes, gradesRes] = await Promise.all([
          supabase.from('past_papers').select('subject', { count: 'exact', head: false }),
          supabase.from('past_papers').select('year', { count: 'exact', head: false }),
          supabase.from('past_papers').select('grade', { count: 'exact', head: false })
        ]);

        if (subjectsRes.error) throw subjectsRes.error;
        if (yearsRes.error) throw yearsRes.error;
        if (gradesRes.error) throw gradesRes.error;

        // Extract unique, sorted values
        const uniqueSubjects = [...new Set(subjectsRes.data?.map((item: any) => item.subject).filter(Boolean))].sort();
        const uniqueYears = [...new Set(yearsRes.data?.map((item: any) => item.year).filter(Boolean))].sort((a, b) => b - a); // Sort descending
        const uniqueGrades = [...new Set(gradesRes.data?.map((item: any) => item.grade).filter(Boolean))].sort((a, b) => a - b); // Sort ascending

        setAvailableSubjects(uniqueSubjects as string[]);
        setAvailableYears(uniqueYears.map(String)); // Convert years to strings for Select
        setAvailableGrades(uniqueGrades.map(String)); // Convert grades to strings for Select

      } catch (err: any) {
        console.error("Error fetching filter options:", err);
        // Handle error - maybe show a toast or message
      } finally {
        setLoadingFilters(false);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch papers based on filters
  useEffect(() => {
    const fetchPapers = async () => {
      setLoading(true);
      setError(null);

      try {
        let query = supabase.from('past_papers').select('*'); // Assuming table name is 'past_papers'

        // Apply filters - TODO: Adjust based on actual filter values/database columns
        if (selectedSubject !== "All Subjects") {
          query = query.eq('subject', selectedSubject);
        }
        if (selectedYear !== "All Years") {
          query = query.eq('year', parseInt(selectedYear));
        }
        if (selectedGrade !== "All Grades") {
          query = query.eq('grade', parseInt(selectedGrade)); // Assuming grade is numeric
        }
        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }

        const { data, error: fetchError } = await query.order('year', { ascending: false }).order('title');

        if (fetchError) throw fetchError;
        setPapers(data || []);
      } catch (err: any) {
        console.error("Error fetching past papers:", err);
        setError("Failed to load past papers. Please try again.");
        setPapers([]); // Clear papers on error
      } finally {
        setLoading(false);
      }
    };

    fetchPapers();
  }, [searchTerm, selectedSubject, selectedYear, selectedGrade]);

  // Implement download functionality
  const handleDownload = async (filePath: string) => {
    if (!filePath) return;
    try {
      // Replace 'past-papers-bucket' with your actual bucket name
      const bucketName = 'past_papers'; // <<<--- CHANGE THIS TO YOUR BUCKET NAME
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, 60 * 5); // Signed URL valid for 5 minutes

      if (error) throw error;

      if (data?.signedUrl) {
        // Open in new tab to trigger download (browser behaviour may vary)
        window.open(data.signedUrl, '_blank');
      } else {
        console.error("Failed to get signed URL, no data returned.");
        // TODO: Show user feedback (e.g., toast)
      }

    } catch (err: any) {
      console.error("Error creating signed URL:", err);
      // TODO: Show user feedback (e.g., toast)
    }
  };

  // Filter papers based on search term and filters
  // This filtering is now done in the useEffect query
  // const filteredPapers = papers; // Use 'papers' state directly

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Past Papers</h1>
        <p className="text-muted-foreground">
          Download past examination papers to practice and prepare for your exams.
        </p>
      </div>

      {/* Search and filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search papers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              value={selectedSubject}
              onValueChange={setSelectedSubject}
              disabled={loadingFilters}
            >
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Subjects">All Subjects</SelectItem>
                {availableSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
              disabled={loadingFilters}
            >
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Years">All Years</SelectItem>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedGrade}
              onValueChange={setSelectedGrade}
              disabled={loadingFilters}
            >
              <SelectTrigger>
                <SelectValue placeholder="Grade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Grades">All Grades</SelectItem>
                {availableGrades.map((grade) => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-muted-foreground">Loading papers...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-10 text-red-600">
          <p>{error}</p>
        </div>
      )}

      {/* Papers grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {!loading && !error && papers.length > 0 ? (
          papers.map((paper) => (
            <Card key={paper.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{paper.title}</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="bg-skutopia-50 text-skutopia-700">
                        {paper.subject}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50">
                        {paper.year}
                      </Badge>
                      {/* Assuming grade exists */}
                      {paper.grade && <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        Grade {paper.grade}
                      </Badge>}
                    </div>
                  </div>
                  <div className="bg-green-100 p-2 rounded-md">
                    <FileText className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {/* TODO: Format file size if needed */}
                    {paper.file_size_kb ? `${(paper.file_size_kb / 1024).toFixed(1)} MB` : ''}
                  </span>
                  <Button size="sm" className="gap-1 bg-transparent border border-green-600 text-green-600 hover:bg-green-100 hover:text-green-700" onClick={() => handleDownload(paper.file_path)}>
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          // Display message only if not loading and no error
          !loading && !error && (
            <div className="col-span-full text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <h3 className="mt-2 text-lg font-medium">No papers found</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Try adjusting your search or filters, or check back later.
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default PastPapers;
