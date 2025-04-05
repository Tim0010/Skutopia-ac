import React from 'react';
// Import icons from lucide-react
import { Briefcase, GraduationCap, Linkedin, MapPin } from 'lucide-react';

interface MentorCardProps {
  name: string;
  title: string;
  expertise: string;
  imageFile: string;
  formLink: string;
  university?: string; // Add optional university prop
  company?: string;    // Add optional company prop
  linkedin?: string;   // Add optional linkedin prop
  bio?: string;         // Add optional bio prop
  country?: string;     // Add optional country prop
}

const MentorCard: React.FC<MentorCardProps> = ({ 
  name, 
  title, 
  expertise, 
  imageFile, 
  formLink, 
  university, 
  company, 
  linkedin, 
  bio, 
  country
}) => {
  const imagePath = `/assets/images/mentors/${imageFile}`; // Assuming images are in public/assets/images/mentors

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl rounded-xl p-8 flex flex-col items-center text-center max-w-sm mx-auto transition-shadow duration-300 border border-gray-200 dark:border-gray-700 min-h-[450px]">
      <img
        src={imagePath}
        alt={`Portrait of ${name}`}
        className="w-36 h-36 rounded-full object-cover mb-5 shadow-md"
      />
      {country && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-center gap-1">
          <MapPin size={12} />
          {country}
        </p>
      )}
      <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">{name}</h3>
      <p className="text-indigo-600 dark:text-indigo-400 mb-2 text-sm font-medium flex items-center justify-center gap-1.5">
        <Briefcase size={16} />
        {title}{company && ` @ ${company}`}
      </p>
      {university && (
        <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm flex items-center justify-center gap-1.5">
          <GraduationCap size={16} />
          {university}
        </p>
      )}
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">Expertise: {expertise}</p>
      
      {/* Add Bio section */}
      {bio && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 px-2 line-clamp-3">
          {bio}
        </p>
      )}
      
      <div className="flex-grow"></div>

      <div className="mt-auto w-full flex flex-col items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400 transition-colors">
                <Linkedin size={20} />
            </a>
        )}
        <a href={formLink} target="_blank" rel="noopener noreferrer" className="w-full">
          <button className="w-full bg-indigo-600 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ease-in-out">
            Book Session
          </button>
        </a>
      </div>
    </div>
  );
};

export default MentorCard; 