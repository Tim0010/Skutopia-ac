
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, CalendarClock, Award, GraduationCap, ExternalLink } from "lucide-react";

// Sample scholarships data
const scholarshipsData = [
  {
    id: "sch1",
    title: "Mastercard Foundation Scholars Program",
    provider: "Mastercard Foundation",
    type: "Full Scholarship",
    level: "Undergraduate",
    deadline: "2023-12-15",
    country: "Multiple Countries",
    description: "The Mastercard Foundation Scholars Program provides full scholarships to young Africans who are committed to giving back to their communities.",
    eligibility: "African students with strong academic performance and demonstrated leadership qualities.",
    benefits: "Full tuition, accommodation, travel costs, and stipend.",
    applyUrl: "https://mastercardfdn.org/scholarships"
  },
  {
    id: "sch2",
    title: "Our Moon Zambia Scholarship",
    provider: "Our Moon Zambia",
    type: "Full Scholarship",
    level: "Undergraduate",
    deadline: "2023-11-30",
    country: "Zambia",
    description: "Our Moon Zambia provides scholarships to bright but financially disadvantaged Zambian students to study at top universities.",
    eligibility: "Zambian nationals who have completed secondary school with exceptional grades.",
    benefits: "University placement support, full tuition, accommodation, and living expenses.",
    applyUrl: "https://ourmoon.org.uk/apply"
  },
  {
    id: "sch3",
    title: "Yale Young African Scholars",
    provider: "Yale University",
    type: "Academic Program",
    level: "High School",
    deadline: "2024-02-15",
    country: "Multiple Countries",
    description: "Yale Young African Scholars (YYAS) is an intensive academic and enrichment program designed for African secondary school students.",
    eligibility: "African secondary school students in their penultimate year with strong academic records.",
    benefits: "Academic instruction, university guidance, and need-based financial aid for participants.",
    applyUrl: "https://africanscholars.yale.edu/apply"
  },
  {
    id: "sch4",
    title: "Yale Young Global Scholars",
    provider: "Yale University",
    type: "Academic Program",
    level: "High School",
    deadline: "2024-01-15",
    country: "Global",
    description: "Yale Young Global Scholars (YYGS) is an academic enrichment program for outstanding high school students from around the world.",
    eligibility: "High school students aged 15-17 with strong academic records and leadership potential.",
    benefits: "Academic instruction, mentorship, and need-based financial aid for participants.",
    applyUrl: "https://globalscholars.yale.edu/apply"
  },
  {
    id: "sch5",
    title: "Chevening Scholarships",
    provider: "UK Government",
    type: "Full Scholarship",
    level: "Masters",
    deadline: "2023-11-01",
    country: "United Kingdom",
    description: "Chevening is the UK Government's international scholarships program aimed at developing global leaders.",
    eligibility: "Graduates with at least two years of work experience and strong academic backgrounds.",
    benefits: "Tuition fees, living expenses, return flights, and additional grants.",
    applyUrl: "https://www.chevening.org/scholarships/"
  },
  {
    id: "sch6",
    title: "Rhodes Scholarships",
    provider: "Rhodes Trust",
    type: "Full Scholarship",
    level: "Postgraduate",
    deadline: "2023-10-01",
    country: "United Kingdom",
    description: "The Rhodes Scholarship is an international postgraduate award for students to study at the University of Oxford.",
    eligibility: "Outstanding academic achievement, character, leadership, and commitment to service.",
    benefits: "All university and college fees, personal stipend, and one economy class airfare to Oxford.",
    applyUrl: "https://www.rhodeshouse.ox.ac.uk/scholarships/apply/"
  },
  {
    id: "sch7",
    title: "DAAD Scholarships",
    provider: "German Academic Exchange Service",
    type: "Full/Partial Scholarship",
    level: "Multiple",
    deadline: "2024-03-15",
    country: "Germany",
    description: "DAAD offers scholarships for international students to study at German universities.",
    eligibility: "International students with strong academic records and a clear study/research plan.",
    benefits: "Monthly stipends, health insurance, travel allowance, and study/research support.",
    applyUrl: "https://www.daad.de/en/study-and-research-in-germany/scholarships/"
  },
];

const levels = ["All Levels", "High School", "Undergraduate", "Masters", "Postgraduate", "Multiple"];
const types = ["All Types", "Full Scholarship", "Partial Scholarship", "Academic Program", "Full/Partial Scholarship"];
const countries = ["All Countries", "Multiple Countries", "United Kingdom", "Germany", "Zambia", "Global"];

const Scholarships = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedType, setSelectedType] = useState("All Types");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [expandedScholarship, setExpandedScholarship] = useState<string | null>(null);

  // Filter scholarships based on search term and filters
  const filteredScholarships = scholarshipsData.filter((scholarship) => {
    // Search term matching
    const matchesSearch = 
      scholarship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scholarship.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter matching
    const matchesLevel = selectedLevel === "All Levels" || scholarship.level === selectedLevel;
    const matchesType = selectedType === "All Types" || scholarship.type === selectedType;
    const matchesCountry = selectedCountry === "All Countries" || scholarship.country === selectedCountry;

    return matchesSearch && matchesLevel && matchesType && matchesCountry;
  });

  // Format deadline date
  const formatDeadline = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Check if deadline is approaching (within 30 days)
  const isDeadlineApproaching = (dateString: string) => {
    const deadline = new Date(dateString);
    const today = new Date();
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  const toggleExpandScholarship = (id: string) => {
    if (expandedScholarship === id) {
      setExpandedScholarship(null);
    } else {
      setExpandedScholarship(id);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Scholarship Opportunities</h1>
        <p className="text-muted-foreground">
          Explore available scholarships and academic opportunities to further your education.
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
                placeholder="Search scholarships..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select
              value={selectedLevel}
              onValueChange={setSelectedLevel}
            >
              <SelectTrigger>
                <SelectValue placeholder="Education Level" />
              </SelectTrigger>
              <SelectContent>
                {levels.map((level) => (
                  <SelectItem key={level} value={level}>{level}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedType}
              onValueChange={setSelectedType}
            >
              <SelectTrigger>
                <SelectValue placeholder="Scholarship Type" />
              </SelectTrigger>
              <SelectContent>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedCountry}
              onValueChange={setSelectedCountry}
            >
              <SelectTrigger>
                <SelectValue placeholder="Country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Scholarships list */}
      <div className="grid gap-6">
        {filteredScholarships.length > 0 ? (
          filteredScholarships.map((scholarship) => (
            <Card key={scholarship.id} className={expandedScholarship === scholarship.id ? "border-skutopia-300" : ""}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{scholarship.title}</CardTitle>
                    <CardDescription className="text-sm">
                      Provided by {scholarship.provider}
                    </CardDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="secondary" className="bg-skutopia-100 text-skutopia-700 border-0">
                        {scholarship.type}
                      </Badge>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-0">
                        {scholarship.level}
                      </Badge>
                      <Badge variant="outline" className="bg-gray-50 border-0">
                        {scholarship.country}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <CalendarClock className="h-4 w-4 text-amber-500" />
                    <span className={`text-sm ${isDeadlineApproaching(scholarship.deadline) ? "text-amber-500 font-medium" : ""}`}>
                      Deadline: {formatDeadline(scholarship.deadline)}
                      {isDeadlineApproaching(scholarship.deadline) && " (Approaching)"}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">
                  {scholarship.description}
                </p>
                
                {expandedScholarship === scholarship.id && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="font-medium mb-2">Eligibility Criteria</h4>
                    <p className="text-sm mb-4">{scholarship.eligibility}</p>
                    
                    <h4 className="font-medium mb-2">Benefits</h4>
                    <p className="text-sm">{scholarship.benefits}</p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => toggleExpandScholarship(scholarship.id)}
                >
                  {expandedScholarship === scholarship.id ? "Show Less" : "Show More"}
                </Button>
                <Button asChild>
                  <a href={scholarship.applyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    Apply Now <ExternalLink className="h-4 w-4 ml-1" />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Award className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
            <h3 className="mt-2 text-lg font-medium">No scholarships found</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Try adjusting your search or filters to find available opportunities.
            </p>
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GraduationCap className="mr-2 h-5 w-5 text-skutopia-500" />
            Popular Scholarship Programs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scholarshipsData.slice(0, 5).map((scholarship) => (
                <TableRow key={`table-${scholarship.id}`}>
                  <TableCell className="font-medium">{scholarship.title}</TableCell>
                  <TableCell>{scholarship.provider}</TableCell>
                  <TableCell>{scholarship.level}</TableCell>
                  <TableCell>
                    <span className={isDeadlineApproaching(scholarship.deadline) ? "text-amber-500 font-medium" : ""}>
                      {formatDeadline(scholarship.deadline)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <a href={scholarship.applyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                        Apply <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Scholarships;
