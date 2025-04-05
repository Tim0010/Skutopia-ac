
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, MenuIcon, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import Logo from "@/components/Logo";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <header className="bg-white dark:bg-gray-900 shadow-sm border-b">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              {mobileMenuOpen ? (
                <X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <MenuIcon className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
            <div className="ml-4 md:hidden">
              <Logo className="h-8 w-auto" />
            </div>
          </div>

          <div className="hidden md:flex md:flex-1 md:items-center">
            <div className="w-full max-w-lg lg:max-w-xs">
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <Input
                  id="search"
                  name="search"
                  className="block w-full rounded-md border pl-10"
                  placeholder="Search for courses, mentors..."
                  type="search"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-skutopia-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-skutopia-500"></span>
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="ml-2 relative rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                >
                  <span className="sr-only">Open user menu</span>
                  <Avatar>
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard")}>Dashboard</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile-settings")}>Profile</DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/profile-settings")}>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="space-y-1 px-2 pb-3 pt-2 bg-skutopia-50 dark:bg-skutopia-900/20">
            <a
              href="/dashboard"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-skutopia-100 hover:text-skutopia-700"
            >
              Dashboard
            </a>
            <a
              href="/mentors"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-skutopia-100 hover:text-skutopia-700"
            >
              Mentors
            </a>
            <a
              href="/videos"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-skutopia-100 hover:text-skutopia-700"
            >
              Videos
            </a>
            <a
              href="/flashcards"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-skutopia-100 hover:text-skutopia-700"
            >
              Flashcards
            </a>
            <a
              href="/quizzes"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-skutopia-100 hover:text-skutopia-700"
            >
              Quizzes
            </a>
            <a
              href="/pastpapers"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-skutopia-100 hover:text-skutopia-700"
            >
              Past Papers
            </a>
            <a
              href="/scholarships"
              className="block rounded-md px-3 py-2 text-base font-medium text-gray-700 hover:bg-skutopia-100 hover:text-skutopia-700"
            >
              Scholarships
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
