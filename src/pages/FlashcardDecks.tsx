
import { useState } from "react";
import { BookOpen, Clock, PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

// Mock data for flashcard decks
const decksData = [
  {
    id: "deck1",
    title: "Algebra Fundamentals",
    description: "Master the basic concepts of algebra with these comprehensive flashcards.",
    cardCount: 30,
    category: "Mathematics",
    creator: "Dr. Sarah Johnson",
    progress: 75,
    lastStudied: "2023-06-15T14:30:00",
    difficulty: "Beginner",
    tags: ["Algebra", "Equations", "Mathematics"]
  },
  {
    id: "deck2",
    title: "Physics Laws and Principles",
    description: "Memorize key physics laws and principles with these carefully crafted flashcards.",
    cardCount: 25,
    category: "Physics",
    creator: "Prof. David Mukasa",
    progress: 40,
    lastStudied: "2023-06-18T09:45:00",
    difficulty: "Intermediate",
    tags: ["Physics", "Laws", "Mechanics"]
  },
  {
    id: "deck3",
    title: "Chemical Elements and Properties",
    description: "Learn about chemical elements, their symbols, and key properties.",
    cardCount: 118,
    category: "Chemistry",
    creator: "Ms. Esther Banda",
    progress: 22,
    lastStudied: "2023-06-10T16:20:00",
    difficulty: "Advanced",
    tags: ["Chemistry", "Elements", "Periodic Table"]
  },
  {
    id: "deck4",
    title: "Human Body Systems",
    description: "Explore the various systems of the human body and their functions.",
    cardCount: 45,
    category: "Biology",
    creator: "Mr. John Zulu",
    progress: 60,
    lastStudied: "2023-06-20T11:15:00",
    difficulty: "Intermediate",
    tags: ["Biology", "Anatomy", "Physiology"]
  },
  {
    id: "deck5",
    title: "Programming Concepts",
    description: "Essential programming concepts and terminology for beginners and intermediate learners.",
    cardCount: 40,
    category: "Computer Science",
    creator: "Dr. Rebecca Chanda",
    progress: 90,
    lastStudied: "2023-06-22T15:30:00",
    difficulty: "Beginner",
    tags: ["Programming", "Computer Science", "Coding"]
  },
  {
    id: "deck6",
    title: "Key Historical Events",
    description: "Important dates and events in Zambian and world history.",
    cardCount: 50,
    category: "History",
    creator: "Mr. Daniel Phiri",
    progress: 30,
    lastStudied: "2023-06-12T10:45:00",
    difficulty: "Intermediate",
    tags: ["History", "Events", "Dates"]
  },
];

const FlashcardDecks = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const navigate = useNavigate();

  // Filter decks based on search term and category
  const filteredDecks = decksData.filter((deck) => {
    const matchesSearch =
      searchTerm === "" ||
      deck.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deck.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory =
      selectedCategory === "" || deck.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Get unique categories for the filter
  const categories = Array.from(
    new Set(decksData.map((deck) => deck.category))
  ).sort();

  // Format the last studied date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Flashcard Decks</h1>
          <p className="text-muted-foreground">
            Study and review with our interactive flashcard collections
          </p>
        </div>
        <Button className="mt-4 sm:mt-0 bg-skutopia-600 hover:bg-skutopia-700">
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Deck
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, description, or creator..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-categories">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredDecks.length} decks
      </div>

      {/* Decks grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDecks.map((deck) => (
          <Card key={deck.id} className="hover:border-skutopia-300 dark:hover:border-skutopia-700 transition-all duration-300">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{deck.title}</CardTitle>
                <Badge
                  variant="outline"
                  className={`
                    border-skutopia-200 dark:border-skutopia-800
                    ${deck.difficulty === "Beginner" ? "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" : ""}
                    ${deck.difficulty === "Intermediate" ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : ""}
                    ${deck.difficulty === "Advanced" ? "bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" : ""}
                  `}
                >
                  {deck.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-0">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {deck.description}
              </p>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center text-sm text-muted-foreground">
                  <BookOpen className="mr-1 h-4 w-4" />
                  <span>{deck.cardCount} cards</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="mr-1 h-4 w-4" />
                  <span>
                    {deck.lastStudied ? `Last studied: ${formatDate(deck.lastStudied)}` : "Not studied yet"}
                  </span>
                </div>
              </div>
              <div className="space-y-2 mb-3">
                <div className="flex justify-between text-xs">
                  <span>Progress</span>
                  <span>{deck.progress}%</span>
                </div>
                <Progress value={deck.progress} className="h-2" />
              </div>
              <div className="flex flex-wrap gap-1 mt-3">
                {deck.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-skutopia-50 text-skutopia-700 dark:bg-skutopia-900/50 dark:text-skutopia-300 border-skutopia-200 dark:border-skutopia-800 text-xs"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-4 grid grid-cols-2 gap-2">
              <Button variant="outline">Review</Button>
              <Button className="bg-skutopia-600 hover:bg-skutopia-700">Study</Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredDecks.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
          <h3 className="mt-4 text-lg font-medium">No flashcard decks found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search or filter, or create a new deck
          </p>
        </div>
      )}
    </div>
  );
};

export default FlashcardDecks;
