import React, { useEffect, useState, useMemo } from 'react';
import {
    fetchScholarships,
    fetchDistinctCountries,
    fetchDistinctFields,
    fetchDistinctLevels,
    Scholarship,
    ScholarshipFilters
} from '../data/scholarshipService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ExternalLink, BookOpenCheck } from 'lucide-react'; // Using BookOpenCheck for "Apply"
import { Badge } from "@/components/ui/badge";
import { format, parseISO } from 'date-fns'; // For formatting dates

const ScholarshipsPage: React.FC = () => {
    // Filter options state
    const [countries, setCountries] = useState<string[]>([]);
    const [fields, setFields] = useState<string[]>([]);
    const [levels, setLevels] = useState<string[]>([]);

    // Selected filters state
    const [selectedCountry, setSelectedCountry] = useState<string>("");
    const [selectedField, setSelectedField] = useState<string>("");
    const [selectedLevel, setSelectedLevel] = useState<string>("");

    // Data and loading state
    const [scholarships, setScholarships] = useState<Scholarship[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch filter options on mount
    useEffect(() => {
        const loadFilters = async () => {
            try {
                const [fetchedCountries, fetchedFields, fetchedLevels] = await Promise.all([
                    fetchDistinctCountries(),
                    fetchDistinctFields(),
                    fetchDistinctLevels(),
                ]);
                setCountries(fetchedCountries);
                setFields(fetchedFields);
                setLevels(fetchedLevels);
            } catch (err) {
                console.error("Error loading scholarship filter options:", err);
                setError("Could not load filter options. Please try refreshing.");
            }
        };
        loadFilters();
    }, []);

    // Memoize filters for the fetchScholarships call
    const currentFilters: ScholarshipFilters = useMemo(() => ({
        country: selectedCountry || undefined,
        field_of_study: selectedField || undefined,
        level: selectedLevel || undefined,
    }), [selectedCountry, selectedField, selectedLevel]);

    // Fetch scholarships when filters change
    useEffect(() => {
        setLoading(true);
        setError(null);
        fetchScholarships(currentFilters)
            .then(data => {
                setScholarships(data);
            })
            .catch(err => {
                console.error("Error fetching scholarships:", err);
                setError("Could not load scholarships. Please check your connection or filters.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [currentFilters]);

    // --- Render Logic ---

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6 text-center">🎓 Scholarship Portal</h1>

            {/* Filter Controls */}
            <Card className="mb-6 bg-muted/40"> {/* Subtle background */}
                <CardHeader>
                    <CardTitle>Find Scholarships</CardTitle>
                    <CardDescription>Filter by country, field of study, and academic level.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     {/* Country Filter */}
                    <Select value={selectedCountry || "all"} onValueChange={value => setSelectedCountry(value === "all" ? "" : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Country" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Countries</SelectItem>
                            {countries.map(country => (
                                <SelectItem key={country} value={country}>{country}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                     {/* Field of Study Filter */}
                    <Select value={selectedField || "all"} onValueChange={value => setSelectedField(value === "all" ? "" : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Field of Study" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Fields</SelectItem>
                            {fields.map(field => (
                                <SelectItem key={field} value={field}>{field}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                     {/* Level Filter */}
                     <Select value={selectedLevel || "all"} onValueChange={value => setSelectedLevel(value === "all" ? "" : value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Level" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            {levels.map(level => (
                                <SelectItem key={level} value={level}>{level}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {/* Loading State */}
            {loading && (
                <div className="text-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                    <p className="text-muted-foreground">Loading scholarships...</p>
                </div>
            )}

            {/* Error State */}
            {error && !loading && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {/* No Results State */}
            {!loading && !error && scholarships.length === 0 && (
                 <p className="text-center text-muted-foreground py-10">No scholarships found matching your criteria.</p>
            )}

            {/* Scholarships List - Using Cards */}
            {!loading && !error && scholarships.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {scholarships.map((scholarship) => (
                        <Card key={scholarship.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-200">
                             <CardHeader>
                                <CardTitle className="text-lg">{scholarship.title}</CardTitle>
                                <CardDescription className="text-sm pt-1">{scholarship.organization}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-grow space-y-2">
                                <p className="text-sm text-muted-foreground line-clamp-3">{scholarship.description}</p>
                                <div className="text-xs space-y-1">
                                    <p><span className="font-medium">Country:</span> {scholarship.country}</p>
                                    <p><span className="font-medium">Level:</span> {scholarship.level}</p>
                                    <p><span className="font-medium">Field:</span> {scholarship.field_of_study}</p>
                                    <p><span className="font-medium">Eligibility:</span> {scholarship.eligibility}</p>
                                    <p><span className="font-medium">Deadline:</span>
                                        <Badge variant={new Date(scholarship.deadline) < new Date() ? "destructive" : "secondary"} className="ml-1">
                                            {format(parseISO(scholarship.deadline + 'T00:00:00'), 'PPP')} {/* Format date */}
                                        </Badge>
                                    </p>
                                </div>
                            </CardContent>
                            <div className="p-4 pt-0 border-t mt-4 flex justify-end"> {/* Footer for action button */}
                                <Button asChild variant="default" size="sm">
                                    <a href={scholarship.application_link} target="_blank" rel="noopener noreferrer">
                                        Apply Now <ExternalLink className="ml-2 h-4 w-4" />
                                    </a>
                                </Button>
                                {/* Add Save/Bookmark button here later */}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ScholarshipsPage;
