import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Users,
  Video,
  BookOpenText,
  Check,
  CalendarClock,
  PersonStanding,
  Sparkles,
  GraduationCap,
  ArrowRight,
  Star,
  ChevronRight,
  Menu,
  Mail,
  Facebook,
  Youtube
} from "lucide-react";
import Logo from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  const fadeInUpVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 15
      }
    }
  };

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
                <Logo />
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

      {/* Hero section - Creative and professional design */}
      <div className="relative overflow-hidden bg-gradient-to-br from-skutopia-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950">
        {/* Creative animated background elements */}
        <motion.div
          className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-skutopia-100 dark:bg-skutopia-900/20 blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            y: [0, -30, 0]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute bottom-40 left-[5%] w-96 h-96 rounded-full bg-blue-50 dark:bg-blue-900/10 blur-3xl hidden sm:block"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 40, 0]
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            repeatType: "reverse",
            delay: 1
          }}
        />

        {/* Geometric shapes for visual interest */}
        <motion.div
          className="absolute top-[20%] left-[15%] w-16 h-16 bg-skutopia-200/30 dark:bg-skutopia-700/30 rounded-md hidden md:block"
          animate={{
            rotate: [0, 180],
            scale: [1, 0.9, 1]
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute bottom-[15%] right-[20%] w-24 h-24 border-2 border-skutopia-300/40 dark:border-skutopia-600/40 rounded-full hidden md:block"
          animate={{
            rotate: [0, -180],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-10 sm:pb-16 md:pt-12 md:pb-20 lg:pt-16 lg:pb-24 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-center">
            <motion.div
              className="lg:col-span-7 mb-12 lg:mb-0"
              initial="hidden"
              animate="visible"
              variants={containerVariants}
            >
              <motion.div variants={itemVariants} className="flex items-center mb-4 sm:mb-6">
                <div className="bg-skutopia-100 dark:bg-skutopia-900/30 text-skutopia-600 dark:text-skutopia-400 px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-medium inline-flex items-center">
                  <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1" /> Premium Learning Experience
                </div>
              </motion.div>

              <motion.h1
                variants={itemVariants}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white"
              >
                <span className="block text-left">Skutopia</span>
                <span className="block text-skutopia-600 text-left mt-2">The Success Academy</span>
              </motion.h1>

              <motion.p
                variants={itemVariants}
                className="mt-4 sm:mt-6 text-base sm:text-lg text-gray-600 dark:text-gray-300 text-left max-w-2xl"
              >
                Skutopia Academy offers a complete educational platform designed for
                Zambian students, combining personal mentorship with self-paced learning tools for
                a comprehensive educational experience.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4"
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button asChild size="lg" className="w-full sm:w-auto bg-skutopia-600 hover:bg-skutopia-700 rounded-full px-6 sm:px-8 shadow-lg shadow-skutopia-600/20">
                    <Link to="/signup">Get Started <ArrowRight className="ml-2 h-5 w-5" /></Link>
                  </Button>
                </motion.div>
                {/* Optionally add a secondary action button here if needed */}
                {/* <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" asChild className="w-full sm:w-auto rounded-full px-6 sm:px-8">
                    <Link to="/learn-more">Learn More</Link>
                  </Button>
                </motion.div> */}
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="mt-8 sm:mt-10 flex items-center"
              >
                <div className="flex -space-x-2">
                  <motion.img
                    whileHover={{ y: -5 }}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-white dark:ring-gray-900 object-cover"
                    src="/assets/icons/chibinda.jpg"
                    alt="Student icon 1"
                  />
                  <motion.img
                    whileHover={{ y: -5 }}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-white dark:ring-gray-900 object-cover"
                    src="/assets/icons/Chungu.jpg"
                    alt="Student icon 2"
                  />
                  <motion.img
                    whileHover={{ y: -5 }}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-white dark:ring-gray-900 object-cover"
                    src="/assets/icons/Quality_learning.jpg"
                    alt="Student icon 3"
                  />
                  <motion.img
                    whileHover={{ y: -5 }}
                    className="h-8 w-8 sm:h-10 sm:w-10 rounded-full ring-2 ring-white dark:ring-gray-900 object-cover"
                    src="/assets/icons/florence.jpg"
                    alt="Student icon 4"
                  />
                </div>
                <span className="ml-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
                  Join <span className="text-skutopia-600 font-bold">500+</span> students already learning
                </span>
              </motion.div>
            </motion.div>

            {/* Image Column */}
            <motion.div
              className="lg:col-span-5 mt-10 lg:mt-0 flex justify-center items-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
            >
              <img
                src="/assets/landing/student.png"
                alt="Student studying with Skutopia Academy resources"
                className="rounded-lg shadow-xl w-full max-w-sm object-cover"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Features section - Modern card design with hover effects */}
      <div className="py-16 sm:py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-base font-semibold text-skutopia-600 dark:text-skutopia-400 tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to succeed
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
              Our comprehensive platform provides all the tools and resources Zambian students need to excel in their studies.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
            {/* Mentors Card */}
            <motion.div
              className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -5 }}
            >
              <div className="h-48 bg-gradient-to-br from-purple-500 to-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/features/mentors.png')] bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold">Mentors</h3>
                  <div className="w-12 h-1 bg-white rounded mt-2"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 mb-4">
                  <PersonStanding className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Connect with experienced mentors who provide personalized guidance to help you navigate your educational journey.
                </p>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="inline-flex items-center text-purple-600 dark:text-purple-400 font-medium"
                >
                  <Link to="/mentors" className="flex items-center">
                    Find a mentor
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Videos Card */}
            <motion.div
              className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -5 }}
            >
              <div className="h-48 bg-gradient-to-br from-blue-500 to-cyan-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/features/videos.jpg')] bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold">Video Lessons</h3>
                  <div className="w-12 h-1 bg-white rounded mt-2"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 mb-4">
                  <Video className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Watch high-quality video lessons that break down complex topics into easy-to-understand segments for effective learning.
                </p>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="inline-flex items-center text-blue-600 dark:text-blue-400 font-medium"
                >
                  <Link to="/videos" className="flex items-center">
                    Browse videos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Flashcards Card */}
            <motion.div
              className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -5 }}
            >
              <div className="h-48 bg-gradient-to-br from-amber-500 to-yellow-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/features/flashcards.jpg')] bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold">Flashcards</h3>
                  <div className="w-12 h-1 bg-white rounded mt-2"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 mb-4">
                  <BookOpenText className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Use our interactive flashcard system to enhance your memory and understanding of key concepts and facts.
                </p>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="inline-flex items-center text-amber-600 dark:text-amber-400 font-medium"
                >
                  <Link to="/flashcards" className="flex items-center">
                    Study flashcards
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Quizzes Card */}
            <motion.div
              className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              whileHover={{ y: -5 }}
            >
              <div className="h-48 bg-gradient-to-br from-green-500 to-emerald-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/features/quizzes.jpg')] bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold">Quizzes</h3>
                  <div className="w-12 h-1 bg-white rounded mt-2"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
                  <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Test your knowledge with our collection of quizzes designed to help you assess your understanding and identify areas for improvement.
                </p>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="inline-flex items-center text-green-600 dark:text-green-400 font-medium"
                >
                  <Link to="/quizzes" className="flex items-center">
                    Take quizzes
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Past Papers Card */}
            <motion.div
              className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 }}
              whileHover={{ y: -5 }}
            >
              <div className="h-48 bg-gradient-to-br from-red-500 to-rose-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/features/past-papers.jpg')] bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold">Past Papers</h3>
                  <div className="w-12 h-1 bg-white rounded mt-2"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
                  <BookOpen className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Practice with previous examination papers to familiarize yourself with the format and types of questions you'll face in your exams.
                </p>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="inline-flex items-center text-red-600 dark:text-red-400 font-medium"
                >
                  <Link to="/past-papers" className="flex items-center">
                    Access past papers
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>

            {/* Scholarships Card */}
            <motion.div
              className="group relative bg-white dark:bg-gray-900 rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-800"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              whileHover={{ y: -5 }}
            >
              <div className="h-48 bg-gradient-to-br from-skutopia-500 to-skutopia-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/assets/features/Scholarship.jpg')] bg-cover bg-center opacity-60 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold">Scholarships</h3>
                  <div className="w-12 h-1 bg-white rounded mt-2"></div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-skutopia-100 dark:bg-skutopia-900/30 mb-4">
                  <GraduationCap className="h-6 w-6 text-skutopia-600 dark:text-skutopia-400" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Discover scholarship opportunities to fund your education and achieve your academic goals without financial barriers.
                </p>
                <motion.div
                  whileHover={{ x: 5 }}
                  className="inline-flex items-center text-skutopia-600 dark:text-skutopia-400 font-medium"
                >
                  <Link to="/scholarships" className="flex items-center">
                    Find scholarships
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Testimonials section - New addition */}
      <div className="py-16 sm:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-base font-semibold text-skutopia-600 dark:text-skutopia-400 tracking-wide uppercase">Testimonials</h2>
            <p className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
              What our students say
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
              Hear from students who have transformed their educational journey with Skutopia.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Rodwell",
                role: "University Student, Russia",
                image: "/assets/testimonials/Rodwell.jpg",
                quote: `Skutopia significantly improved my ECZ exam preparation, giving me the confidence and resources to excel. More than that, it opened doors to global opportunities I never imagined possible. I’m excited to see how this platform will continue to empower and transform students' lives across the nation.`
              },
              {
                name: "Florence",
                role: "University Student, Ghana",
                image: "/assets/testimonials/florence.jpg",
                quote: `Skutopia opened my eyes to opportunities I never had access to. Through it, I discovered Our Moon Education, a charity running a gap-year program. Though my application was unsuccessful, Our Moon offered me a caregiver role and helped me become a Mastercard Foundation Scholar at KNUST, Ghana. 
                Now in my second year studying Mechanical Engineering, my journey has been both tough and exciting. Adapting to a new country has deepened my appreciation for cultural diversity. The friendships and networks I've built will guide me wherever I go. 
                I'm grateful to Skutopia for laying a strong foundation for my academic journey.`
              },
              {
                name: "Chungu",
                role: "University Student, USA",
                image: "/assets/testimonials/Chungu.jpg",
                quote: `Skutopia is more than just an educational platform—it's a home. It has provided me with a strong sense of belonging while expanding my international exposure through mentorship and its commitment to academic excellence. Beyond academics, Skutopia has nurtured my personal and professional growth, equipping me with the skills and connections to navigate the world with confidence.`
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 sm:p-8 relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="absolute top-6 right-6 text-skutopia-200 dark:text-skutopia-700">
                  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M11.25 25H5V18.75C5 14.625 8.375 11.25 12.5 11.25V15C10.625 15 9.375 16.25 9.375 18.125H11.25V25ZM23.75 25H17.5V18.75C17.5 14.625 20.875 11.25 25 11.25V15C23.125 15 21.875 16.25 21.875 18.125H23.75V25Z" fill="currentColor" />
                  </svg>
                </div>

                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-skutopia-200 dark:border-skutopia-700"
                  />
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-300 italic leading-relaxed">{testimonial.quote}</p>

                <div className="mt-4 flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-yellow-400" fill="currentColor" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer - Updated to match the image */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company info */}
            <div className="col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-skutopia-500 rounded-sm flex items-center justify-center">
                  <BookOpen className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">Skutopia</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-xs">
                Empowering Zambian Students through STEM education, mentorship, and career opportunities.
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
                    className="w-6 h-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:text-skutopia-500 dark:hover:text-skutopia-400"
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
                {/* Removed Practice Tests, Learning Paths, Scholarship Opportunities, and Find a Mentor links as requested */}
              </ul>
            </div>

            {/* Legal and Student Voices */}
            <div>
              <div className="mb-8">
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

              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                  Student Voices
                </h3>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400 italic mb-2">
                    "Skutopia helped me prepare for university entrance exams."
                  </p>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    Chanda M.
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Computer Science
                  </p>
                </div>
                <div className="mt-4">
                  <Link to="/join-community" className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-skutopia-600 hover:bg-skutopia-700">
                    Join Our Community
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            <p className="text-xs text-center text-gray-500 dark:text-gray-400">
              Copyright &copy; 2023 Skutopia Academy
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
