
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  GraduationCap,
  Home,
  Users,
  Video,
  BookOpen,
  Megaphone,
  Settings,
  HelpCircle,
  LayoutDashboard,
  FileText,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const Sidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/dashboard" },
    { name: "Mentors", icon: <Users size={20} />, path: "/mentors" },
    { name: "Videos", icon: <Video size={20} />, path: "/videos" },
    { name: "Flashcards", icon: <BookOpen size={20} />, path: "/flashcards" },
    { name: "Quizzes", icon: <Megaphone size={20} />, path: "/quizzes" },
    { name: "Past Papers", icon: <FileText size={20} />, path: "/pastpapers" },
    { name: "Scholarships", icon: <Award size={20} />, path: "/scholarships" }
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col h-screen">
      <div className="flex flex-col flex-1 bg-skutopia-50 dark:bg-skutopia-900/30 border-r">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
          <Logo className="h-8 w-auto" />
        </div>
        <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
          <nav className="flex-1 px-2 space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "group flex items-center px-3 py-2 text-sm font-medium rounded-md",
                    isActive
                      ? "bg-skutopia-100 dark:bg-skutopia-800 text-skutopia-700 dark:text-skutopia-200"
                      : "text-gray-600 dark:text-gray-400 hover:bg-skutopia-100 dark:hover:bg-skutopia-800/60 hover:text-skutopia-700 dark:hover:text-skutopia-300"
                  )
                }
              >
                <div className="mr-3 text-skutopia-500 dark:text-skutopia-400">{item.icon}</div>
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="px-4 mt-6">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <GraduationCap className="h-8 w-8 text-skutopia-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Need help?
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Contact student support
                  </p>
                </div>
              </div>
              <Button variant="link" size="sm" className="mt-2 w-full">
                <HelpCircle size={16} className="mr-1" />
                Get Support
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
