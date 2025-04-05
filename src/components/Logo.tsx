
import { cn } from "@/lib/utils";
import { BookOpen } from "lucide-react";

const Logo = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center", className)}>
      <div className="flex items-center p-1 bg-skutopia-100 dark:bg-skutopia-900 rounded-md">
        <BookOpen className="h-5 w-5 text-skutopia-600 dark:text-skutopia-400" />
      </div>
      <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
        Skutopia<span className="text-skutopia-600 dark:text-skutopia-400">Academy</span>
      </span>
    </div>
  );
};

export default Logo;
