import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";

interface PublicLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

const PublicLayout = ({ children, title, subtitle }: PublicLayoutProps) => {
  const { isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      {/* Navigation - Modern, sleek design with mobile responsiveness */}
      <motion.nav 
        className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 sticky top-0 z-50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link to="/">
                  <Logo />
                </Link>
              </motion.div>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button asChild className="bg-skutopia-600 hover:bg-skutopia-700 rounded-full px-6">
                    <Link to="/dashboard">Dashboard <ChevronRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                </motion.div>
              ) : (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" asChild className="text-gray-700 dark:text-gray-200">
                      <Link to="/login">Login</Link>
                    </Button>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button asChild className="bg-skutopia-600 hover:bg-skutopia-700 rounded-full px-6">
                      <Link to="/signup">Sign Up <ChevronRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </motion.div>
                </>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
                aria-controls="mobile-menu"
                aria-expanded="false"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {isAuthenticated ? (
                  <Button asChild className="w-full bg-skutopia-600 hover:bg-skutopia-700 rounded-full px-6 justify-center">
                    <Link to="/dashboard">Dashboard <ChevronRight className="ml-1 h-4 w-4" /></Link>
                  </Button>
                ) : (
                  <>
                    <Button variant="ghost" asChild className="w-full text-gray-700 dark:text-gray-200 justify-center">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild className="w-full bg-skutopia-600 hover:bg-skutopia-700 rounded-full px-6 justify-center">
                      <Link to="/signup">Sign Up <ChevronRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Main content */}
      <main className="flex-grow">
        {title && (
          <div className="bg-gradient-to-r from-skutopia-50 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950 py-12 sm:py-16 border-b border-gray-100 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4"
              >
                {title}
              </motion.h1>
              {subtitle && (
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto"
                >
                  {subtitle}
                </motion.p>
              )}
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {children}
        </div>
      </main>
      
      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company info */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Logo className="h-6 w-auto" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-xs">
                Empowering Students through education, mentorship, and career opportunities.
              </p>
            </div>

            {/* About */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                About
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/our-mission" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400">
                    Our Mission
                  </Link>
                </li>
                <li>
                  <Link to="/our-team" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400">
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link to="/contact-us" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Resources
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/study-materials" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400">
                    Study Materials
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Legal
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms-of-service" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/cookie-policy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Copyright &copy; {new Date().getFullYear()} Mentorly Academia
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
