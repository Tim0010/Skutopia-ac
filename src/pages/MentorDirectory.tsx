import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { fetchMentors, Mentor } from '@/data/mentorshipService';
import MentorCard from "@/components/MentorCard";

// Hardcoded country mapping (using mentor names as keys)
const mentorCountries: { [key: string]: string } = {
  "Timothy": "Zambia",
  "Omera": "India",
  "Yonas": "Ethiopia",
  "Victoria": "Kenya"
};

const MentorDirectory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMentors = async () => {
    setLoading(true);
    setError(null);
    try {
      // fetchMentors returns Mentor[] directly or throws an error
      const mentorsData = await fetchMentors(); 
      setMentors(mentorsData || []); // Set state with the returned array
    
    } catch (err: any) {
      // Catch errors thrown by fetchMentors
      console.error("Error loading mentors:", err);
      setError(err.message || "Failed to load mentors. Please try again later.");
      setMentors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMentors();
  }, []);

  const filteredMentors = mentors.filter(mentor => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const nameMatch = mentor.name?.toLowerCase().includes(lowerSearchTerm) ?? false;
    const fieldMatch = mentor.field?.toLowerCase().includes(lowerSearchTerm) ?? false;
    const occupationMatch = mentor.occupation?.toLowerCase().includes(lowerSearchTerm) ?? false;
    return nameMatch || fieldMatch || occupationMatch;
  });

  const mentorsToDisplay = filteredMentors;

  return (
    <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-8">
        Mentor Directory
      </h1>

      <div className="mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Search by name, field, or occupation..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-10 text-red-600 dark:text-red-400">
          <p>{error}</p>
          <Button onClick={loadMentors} className="mt-4">Retry</Button>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentorsToDisplay.length > 0 ? (
            mentorsToDisplay.map((mentor) => {
              const imageFileName = mentor.avatar_url?.substring(mentor.avatar_url.lastIndexOf('/') + 1) ?? 'default-avatar.png'; 
              const formLink = "https://forms.gle/71uVZY5piUu3M4hE6";
              // Look up country from the hardcoded map
              const country = mentorCountries[mentor.name ?? ''] || undefined; // Get country or undefined if name doesn't match

              return (
                <MentorCard
                  key={mentor.id}
                  name={mentor.name ?? 'N/A'}
                  title={mentor.occupation ?? mentor.field ?? 'Mentor'}
                  expertise={mentor.field ?? 'Various Topics'}
                  imageFile={imageFileName}
                  formLink={formLink}
                  university={mentor.university}
                  company={mentor.company}
                  linkedin={mentor.linkedin}
                  bio={mentor.bio}
                  country={country} // Pass the country prop
                />
              );
            })
          ) : (
            <div className="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
              <p>No mentors found{searchTerm ? ' matching your search' : ''}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MentorDirectory;
