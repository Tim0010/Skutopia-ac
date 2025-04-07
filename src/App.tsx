import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Callback from "./pages/auth/Callback";
import MentorDirectory from "./pages/MentorDirectory";
import MentorProfile from "./pages/MentorProfile";
import VideoHub from "./pages/VideoHub";
import VideoLearning from "./pages/VideoLearning";
import FlashcardsPage from "./pages/FlashcardsPage";
import QuizPage from "./pages/QuizPage";
import QuizRunner from "./pages/QuizRunner";
import PastPapersPage from "./pages/PastPapersPage";
import Scholarships from "./pages/Scholarships";
import ScholarshipsPage from "./pages/ScholarshipsPage"; // Import the new page
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AuthProvider from "./contexts/AuthContext";
import OurMission from "./pages/OurMission";
import OurTeam from "./pages/OurTeam";
import ContactUs from "./pages/ContactUs";
import StudyMaterials from "./pages/StudyMaterials";

import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import JoinCommunity from "./pages/JoinCommunity";
import MySessions from "./pages/MySessions";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfileSettingsPage from "./pages/ProfileSettings"; // Corrected import path

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminVideos from "./pages/admin/AdminVideos";
import MentorDashboard from "./pages/admin/MentorDashboard";
import AdminMentors from "./pages/admin/AdminMentors";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import QuizBuilder from "./pages/admin/QuizBuilder";
import AnalyticsTracker from "./components/AnalyticsTracker";
import { NotificationProvider } from "./contexts/NotificationContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnalyticsTracker />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/auth/callback" element={<Callback />} />

              {/* About Section Routes */}
              <Route path="/our-mission" element={<OurMission />} />
              <Route path="/our-team" element={<OurTeam />} />
              <Route path="/contact-us" element={<ContactUs />} />

              {/* Resources Section Routes */}
              <Route path="/study-materials" element={<StudyMaterials />} />

              {/* Legal Pages */}
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/cookie-policy" element={<CookiePolicy />} />

              {/* Community Page */}
              <Route path="/join-community" element={<JoinCommunity />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/mentors" element={<MentorDirectory />} />
                <Route path="/mentors/:id" element={<MentorProfile />} />
                <Route path="/videos" element={<VideoLearning />} />
                <Route path="/flashcards" element={<FlashcardsPage />} />
                <Route path="/quizzes" element={<QuizPage />} />
                <Route path="/quiz/:quizId" element={<QuizRunner />} />
                <Route path="/pastpapers" element={<PastPapersPage />} />
                <Route path="/scholarships" element={<ScholarshipsPage />} />
                <Route path="/my-sessions" element={<MySessions />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                <Route path="/profile-settings" element={<ProfileSettingsPage />} />
              </Route>

              {/* Admin Routes */}
              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/mentor-dashboard" element={<MentorDashboard />} />
                <Route path="/admin/mentors" element={<AdminMentors />} />
                <Route path="/admin/videos" element={<AdminVideos />} />
                <Route path="/admin/quizzes" element={<AdminQuizzes />} />
                <Route path="/admin/quiz-builder/:quizId" element={<QuizBuilder />} />
                <Route path="/admin/quiz-builder" element={<QuizBuilder />} />
                <Route path="/admin/flashcards" element={<AdminDashboard />} />
                <Route path="/admin/pastpapers" element={<AdminDashboard />} />
                <Route path="/admin/scholarships" element={<AdminDashboard />} />
                <Route path="/admin/settings" element={<AdminDashboard />} />
              </Route>

              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
