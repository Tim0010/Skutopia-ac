import { Link } from "react-router-dom";
import { Mail, Facebook, Youtube } from "lucide-react";
import Logo from "@/components/Logo";

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Logo className="h-8 w-auto" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-xs">
              Empowering students through STEM education, mentorship, and career opportunities.
            </p>
            <div className="flex space-x-3 mt-6">
              {[
                { name: "email", icon: <Mail className="h-4 w-4" /> },
                { name: "facebook", icon: <Facebook className="h-4 w-4" /> },
                { name: "youtube", icon: <Youtube className="h-4 w-4" /> }
              ].map((social) => (
                <a
                  key={social.name}
                  href="#"
                  className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-skutopia-500 dark:hover:text-skutopia-400 transition-colors"
                >
                  <span className="sr-only">{social.name}</span>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* About */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              About
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/our-mission" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400 transition-colors">
                  Our Mission
                </Link>
              </li>
              <li>
                <Link to="/our-team" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400 transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link to="/contact-us" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400 transition-colors">
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
            <ul className="space-y-3">
              <li>
                <Link to="/study-materials" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400 transition-colors">
                  Study Materials
                </Link>
              </li>
              {/* Removed other resources as requested */}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms-of-service" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400 transition-colors">
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
  );
};

export default Footer;
