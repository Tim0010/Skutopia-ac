import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface PageLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showHeaderSearch?: boolean;
}

const PageLayout = ({ children, title, subtitle, showHeaderSearch = true }: PageLayoutProps) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <Header />
      
      <main className="flex-grow">
        {/* Page header with title and subtitle */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 py-8 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-4xl">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Page content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {children}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PageLayout;
