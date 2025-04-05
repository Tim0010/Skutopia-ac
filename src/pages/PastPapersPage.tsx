import React, { useEffect, useState, useMemo } from 'react';
import {
    fetchPastPapers,
    fetchDistinctSubjects,
    fetchDistinctYears,
    fetchDistinctGrades,
    PastPaper,
    PastPaperFilters
} from '../data/pastPaperService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Download, FileText } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

const PastPapersPage: React.FC = () => {
    // Filter options state
    const [subjects, setSubjects] = useState<string[]>([]);
    const [years, setYears] = useState<number[]>([]);
    const [grades, setGrades] = useState<string[]>([]);

    // Selected filters state
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedYear, setSelectedYear] = useState<string>(""); // Store as string for Select compatibility
    const [selectedGrade, setSelectedGrade] = useState<string>("");

    // Data and loading state
    const [papers, setPapers] = useState<PastPaper[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch filter options on mount
    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [fetchedSubjects, fetchedYears, fetchedGrades] = await Promise.all([
                    fetchDistinctSubjects(),
                    fetchDistinctYears(),
                    fetchDistinctGrades(),
                ]);
                setSubjects(fetchedSubjects);
                setYears(fetchedYears);
                setGrades(fetchedGrades);
            } catch (err) {
                console.error("Error loading filter options:", err);
                setError("Could not load filter options. Please try refreshing.");
                // Don't stop loading papers if filters fail, just show fewer options
            }
        };
        loadFilters();
    }, []);

    // Memoize filters for the fetchPastPapers call
    const currentFilters: PastPaperFilters = useMemo(() => ({
        subject: selectedSubject || undefined,
        year: selectedYear ? parseInt(selectedYear, 10) : undefined,
        grade: selectedGrade || undefined,
    }), [selectedSubject, selectedYear, selectedGrade]);

    // Fetch papers when filters change
    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchPastPapers(currentFilters)
            .then(data => {
                setPapers(data);
            })
            .catch(err => {
                console.error("Error fetching past papers:", err);
                setError("Could not load past papers. Please check your connection or filters.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [currentFilters]);

    // --- Render Logic ---

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">📄 Past Papers</h1>

            {/* Filter Controls */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Filter Papers</CardTitle>
                    <CardDescription>Select subject, year, and grade to find specific papers.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Use "all" for placeholder value and handle in onValueChange */}
                    <Select value={selectedSubject || "all"} onValueChange={value => setSelectedSubject(value === "all" ? "" : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Subject" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Change value from "" to "all" */}
                            <SelectItem value="all">All Subjects</SelectItem>
                            {subjects.map(subject => (
                                <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Use "all" for placeholder value and handle in onValueChange */}
                    <Select value={selectedYear || "all"} onValueChange={value => setSelectedYear(value === "all" ? "" : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Year" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Change value from "" to "all" */}
                            <SelectItem value="all">All Years</SelectItem>
                            {years.map(year => (
                                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Use "all" for placeholder value and handle in onValueChange */}
                    <Select value={selectedGrade || "all"} onValueChange={value => setSelectedGrade(value === "all" ? "" : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Grade" />
                        </SelectTrigger>
                        <SelectContent>
                            {/* Change value from "" to "all" */}
                            <SelectItem value="all">All Grades</SelectItem>
                            {grades.map(grade => (
                                <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p>Loading papers...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* No Results State */}
            {!loading && !error && papers.length === 0 && (
                <p className="text-center text-muted-foreground py-10">No past papers found matching your criteria.</p>
            )}

            {/* Papers List */}
            {!loading && !error && papers.length > 0 && (
                <div className="space-y-4">
                    {papers.map((paper) => (
                        <Card key={paper.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4">
                            <div className="flex items-center space-x-3 mb-2 sm:mb-0">
                                <FileText className="h-6 w-6 text-primary flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold">{paper.subject} - {paper.year}</h3>
                                    <div className="text-sm text-muted-foreground space-x-2">
                                        <span>Grade: {paper.grade}</span>
                                        {paper.level && <Badge variant="secondary">{paper.level}</Badge>}
                                        {paper.file_size !== null && (
                                            <span>({paper.file_size.toFixed(2)} MB)</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <Button asChild variant="default" size="sm">
                                <a href={paper.file_url} target="_blank" rel="noopener noreferrer">
                                    <Download className="mr-2 h-4 w-4" /> Download
                                </a>
                            </Button>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PastPapersPage;
