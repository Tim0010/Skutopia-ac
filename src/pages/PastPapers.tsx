
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, FileText, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

// Sample past papers data
const pastPapersData = [
  {
    id: "pp1",
    title: "Mathematics Paper 1",
    subject: "Mathematics",
    year: "2023",
    level: "Advanced",
    fileSize: "2.4 MB",
    downloadUrl: "/files/math-paper-2023.pdf",
  },
  {
    id: "pp2",
    title: "Physics Final Exam",
    subject: "Physics",
    year: "2023",
    level: "Advanced",
    fileSize: "3.1 MB",
    downloadUrl: "/files/physics-final-2023.pdf",
  },
  {
    id: "pp3",
    title: "Chemistry Mid-term",
    subject: "Chemistry",
    year: "2022",
    level: "Intermediate",
    fileSize: "1.8 MB",
    downloadUrl: "/files/chemistry-midterm-2022.pdf",
  },
  {
    id: "pp4",
    title: "Biology Entrance Exam",
    subject: "Biology",
    year: "2022",
    level: "Basic",
    fileSize: "2.2 MB",
    downloadUrl: "/files/biology-entrance-2022.pdf",
  },
  {
    id: "pp5",
    title: "History Final Paper",
    subject: "History",
    year: "2021",
    level: "Advanced",
    fileSize: "3.5 MB",
    downloadUrl: "/files/history-final-2021.pdf",
  },
  {
    id: "pp6",
    title: "Geography Mid-term",
    subject: "Geography",
    year: "2021",
    level: "Intermediate",
    fileSize: "1.9 MB",
    downloadUrl: "/files/geography-midterm-2021.pdf",
  },
  {
    id: "pp7",
    title: "English Literature",
    subject: "English",
    year: "2020",
    level: "Advanced",
    fileSize: "2.7 MB",
    downloadUrl: "/files/english-lit-2020.pdf",
  },
  {
    id: "pp8",
    title: "Computer Science Fundamentals",
    subject: "Computer Science",
    year: "2020",
    level: "Basic",
    fileSize: "1.5 MB",
    downloadUrl: "/files/cs-fundamentals-2020.pdf",
  },
];

const subjects = ["All Subjects", "Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography", "English", "Computer Science"];
const years = ["All Years", "2023", "2022", "2021", "2020"];
const levels = ["All Levels", "Basic", "Intermediate", "Advanced"];

const PastPapers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [selectedYear, setSelectedYear] = useState("All Years");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");

  // Filter papers based on search term and filters
  const filteredPapers = pastPapersData.filter((paper) => {
    // Search term matching
    const matchesSearch = 
      paper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.subject.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter matching
    const matchesSubject = selectedSubject === "All Subjects" || paper.subject === selectedSubject;
    const matchesYear = selectedYear === "All Years" || paper.year === selectedYear;
    const matchesLevel = selectedLevel === "All Levels" || paper.level === selectedLevel;

    return matchesSearch && matchesSubject && matchesYear && matchesLevel;
  });

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
            >
              <SelectTrigger>
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear}
              onValueChange={setSelectedYear}
            >
              <SelectTrigger>
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedLevel}
              onValueChange={setSelectedLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Papers grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPapers.length > 0 ? (
          filteredPapers.map((paper) => (
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
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {paper.level}
                      </Badge>
                    </div>
                  </div>
                  <div className="bg-skutopia-100 p-2 rounded-md">
                    <FileText className="h-5 w-5 text-skutopia-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">
                    {paper.fileSize}
                  </span>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-2 text-lg font-medium">No papers found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastPapers;
