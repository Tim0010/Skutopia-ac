import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  Shield,
  Users,
  Video,
  BookOpen,
  BookOpenCheck,
  FileQuestion,
  FileText,
  Award,
  Settings,
  HelpCircle,
  LayoutDashboard,
  GraduationCap,
  BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";

const AdminSidebar = () => {
  const { user } = useAuth();

  const navItems = [
    { name: "Admin Dashboard", icon: <LayoutDashboard size={20} />, path: "/admin" },
    { name: "Manage Users", icon: <Users size={20} />, path: "/admin/users" },
    { name: "Mentor Dashboard", icon: <BarChart size={20} />, path: "/admin/mentor-dashboard" },
    { name: "Manage Mentors", icon: <GraduationCap size={20} />, path: "/admin/mentors" },
    { name: "Manage Videos", icon: <Video size={20} />, path: "/admin/videos" },
    { name: "Manage Flashcards", icon: <BookOpen size={20} />, path: "/admin/flashcards" },
    { name: "Manage Quizzes", icon: <BookOpenCheck size={20} />, path: "/admin/quizzes" },
    { name: "Manage Past Papers", icon: <FileText size={20} />, path: "/admin/pastpapers" },
    { name: "Manage Scholarships", icon: <Award size={20} />, path: "/admin/scholarships" },
    { name: "Settings", icon: <Settings size={20} />, path: "/admin/settings" },
  ];

  return (
    <div className="hidden md:flex md:w-64 md:flex-col h-screen">
      <div className="flex flex-col flex-1 bg-red-50 dark:bg-red-900/30 border-r">
        <div className="flex items-center h-16 flex-shrink-0 px-4 border-b bg-red-100 dark:bg-red-950/50">
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-red-700" />
            <Logo className="h-8 w-auto" />
            <span className="text-lg font-bold text-red-800">Admin</span>
          </div>
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
                      ? "bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200"
                      : "text-gray-600 dark:text-gray-400 hover:bg-red-100 dark:hover:bg-red-800/60 hover:text-red-700 dark:hover:text-red-300"
                  )
                }
              >
                <div className="mr-3 text-red-500 dark:text-red-400">{item.icon}</div>
                {item.name}
              </NavLink>
            ))}
          </nav>

          <div className="px-4 mt-6">
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Shield className="h-8 w-8 text-red-500" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    Admin Support
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Need assistance?
                  </p>
                </div>
              </div>
              <Button variant="link" size="sm" className="mt-2 w-full text-red-600">
                <HelpCircle size={16} className="mr-1" />
                Get Help
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
