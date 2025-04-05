import { motion } from "framer-motion";
import { Mail, Linkedin, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";

// Define interface for TeamMember for better type checking
interface TeamMember {
  name: string;
  role: string;
  image: string;
  education: string;
  bio: string;
  email: string;
  linkedin: string;
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100 }
  }
};

export default function OurTeam() {
  // Updated team data structure with 5 members
  const teamMembers: TeamMember[] = [
    {
      name: "Timothy Chileshe",
      role: "Founder & CEO",
      image: "/assets/testimonials/Rodwell.jpg", // Placeholder
      education: "PhD in Education, University of Zambia",
      bio: "Driven visionary with 15+ years in EdTech, passionate about transforming Zambian education through technology and mentorship.",
      email: "mailto:timothy.chileshe@skutopia.com",
      linkedin: "#" // Add actual LinkedIn URL
    },
    {
      name: "Victoria Phiri",
      role: "Head of Curriculum",
      image: "/assets/testimonials/florence.jpg", // Placeholder
      education: "Master's in Educational Psychology",
      bio: "Expert curriculum developer ensuring Skutopia's content is engaging, effective, and aligned with the highest educational standards.",
      email: "mailto:victoria.phiri@skutopia.com",
      linkedin: "#" // Add actual LinkedIn URL
    },
    {
      name: "Omera Mwamba",
      role: "Lead Software Engineer",
      image: "/assets/icons/chibinda.jpg", // Placeholder
      education: "BSc in Computer Science",
      bio: "Leads the technical team, building and refining the Skutopia platform with a focus on user experience and scalability.",
      email: "mailto:omera.mwamba@skutopia.com",
      linkedin: "#" // Add actual LinkedIn URL
    },
    {
      name: "Grace Tembo",
      role: "Mentorship Coordinator",
      image: "/assets/icons/Chungu.jpg", // Placeholder
      education: "BA in Social Work",
      bio: "Connects students with dedicated mentors, fostering supportive relationships that guide academic and personal growth.",
      email: "mailto:grace.tembo@skutopia.com",
      linkedin: "#" // Add actual LinkedIn URL
    },
    {
      name: "Michael Zulu",
      role: "Content Director",
      image: "/assets/features/mentors.png", // Placeholder
      education: "MA in African Literature",
      bio: "Oversees the creation of high-quality, culturally relevant learning materials tailored for the Zambian curriculum.",
      email: "mailto:michael.zulu@skutopia.com",
      linkedin: "#" // Add actual LinkedIn URL
    }
  ];

  return (
    <PublicLayout
      title="Our Team"
      subtitle="Meet the dedicated professionals behind Skutopia Academy"
    >
      {/* Team Member Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 mb-16 md:mb-24"
      >
        {teamMembers.map((member) => (
          <motion.div
            key={member.name}
            variants={cardVariants}
            className="bg-white dark:bg-gray-800/50 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-gray-700/50 flex flex-col hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src={member.image}
              alt={member.name}
              className="w-full h-56 object-cover object-center"
            />
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{member.name}</h3>
              <p className="text-sm font-semibold text-skutopia-600 dark:text-skutopia-400 mb-3">{member.role}</p>

              <div className="flex items-start text-xs text-gray-500 dark:text-gray-400 mb-4">
                <GraduationCap className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>{member.education}</span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 text-sm mb-5 flex-grow">{member.bio}</p>

              <div className="mt-auto border-t border-gray-100 dark:border-gray-700/50 pt-4 flex space-x-4">
                <a
                  href={member.email}
                  aria-label={`Email ${member.name}`}
                  className="text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400 transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </a>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${member.name} on LinkedIn`}
                  className="text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400 transition-colors"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Join Us CTA Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center bg-gray-50 dark:bg-gray-800/50 p-8 md:p-12 rounded-2xl border border-gray-200 dark:border-gray-700/50"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">Join Our Mission</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-6 md:mb-8">
          Are you passionate about education and technology? We're looking for talented individuals to help us empower the next generation of Zambian leaders.
        </p>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button asChild size="lg" className="bg-skutopia-600 hover:bg-skutopia-700 rounded-full px-8 shadow-lg">
            <Link to="/contact-us">Get In Touch</Link>
          </Button>
        </motion.div>
      </motion.div>
    </PublicLayout>
  );
}
