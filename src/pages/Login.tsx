import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Info, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const { login, signInWithGoogle, /* signInWithFacebook, */ user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  // Redirect after user state is confirmed and updated
  useEffect(() => {
    // Wait until auth status is determined
    if (authLoading) {
      return;
    }

    if (user) {
      console.log('Login useEffect: User detected', user);
      // Check for post-login redirect information
      const redirectPath = sessionStorage.getItem('postLoginRedirect');

      let navigateTo = '/dashboard'; // Default redirect for regular users
      if (isAdmin) {
        navigateTo = '/admin'; // Default redirect for admins
      }

      // Override default if a specific path is stored in sessionStorage
      if (redirectPath) {
        navigateTo = redirectPath;
        console.log(`Login useEffect: Found redirect path in sessionStorage: ${navigateTo}`);
        // IMPORTANT: Clean up ONLY the redirect item after reading it
        sessionStorage.removeItem('postLoginRedirect');
        // Leave 'postLoginAction' for the target page
      }

      console.log(`Login useEffect: Navigating to ${navigateTo}`);
      navigate(navigateTo, { replace: true }); // Use replace to avoid back button issues
    }
  }, [user, isAdmin, navigate, authLoading]); // Include authLoading

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setIsLoading(true); // Show loading for social sign in
      await signInWithGoogle();
      // Navigation is handled by useEffect after auth state change
    } catch (err: any) {
      setError("Failed to sign in with Google. Please try again.");
      console.error("Google sign-in error:", err);
      setIsLoading(false); // Stop loading on error
    }
    // setIsLoading(false); // Loading stops implicitly on success via navigation or explicitly on error
  };

  /* Commenting out Facebook login for now
  const handleFacebookSignIn = async () => {
    try {
      setError(null);
      await signInWithFacebook();
    } catch (err: any) {
      setError("Failed to sign in with Facebook. Please try again.");
      console.error("Facebook sign-in error:", err);
    }
  };
  */

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const loginSuccess = await login(data.email, data.password);
      // login function in AuthContext already handles setting user state.
      // The useEffect hook above will handle navigation if loginSuccess is true
      // and the user state gets updated.
      if (!loginSuccess) {
        // If login function itself returned false (e.g., due to specific internal checks)
        // but didn't throw the specific errors we catch below.
        setError("Login failed. Please check your credentials.");
      }
      console.log("Login submitted, waiting for user state update...");
    } catch (err: any) {
      console.error("Login error caught:", err);
      // Check for specific Supabase error messages
      if (err.message && err.message.toLowerCase().includes('email not confirmed')) {
        setError("Please verify your email address by clicking the link sent to your inbox before logging in.");
        toast.error("Email not verified. Please check your inbox.", { duration: 6000 });
      } else if (err.message && err.message.toLowerCase().includes('invalid login credentials')) {
        setError("Invalid email or password. Please try again.");
        toast.error("Invalid email or password.");
      } else {
        setError("An unexpected error occurred during login.");
        toast.error("Login failed due to an unexpected error.");
      }
    } finally {
      // Ensure loading is always stopped
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <Logo className="h-12 w-auto" />
        </Link>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Sign in to your account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{" "}
          <Link to="/signup" className="font-medium text-skutopia-600 hover:text-skutopia-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            {/* Commenting out Facebook login for now
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center justify-center space-x-2"
              onClick={handleFacebookSignIn}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span>Continue with Facebook</span>
            </Button>
            */}
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full dark:bg-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with email</span>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Invalid email address"
                    }
                  })}
                  className={`dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 ${errors.email ? "border-red-500 dark:border-red-500" : ""}`}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters"
                    }
                  })}
                  className={`dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 ${errors.password ? "border-red-500 dark:border-red-500" : ""}`}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-skutopia-600 focus:ring-skutopia-500 border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-skutopia-600 hover:text-skutopia-500">
                  Forgot your password?
                </a>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <Shield className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>

          {/* User Account Note Alert */}
          <Alert className="mt-6">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs">
              New accounts require email confirmation before login. Didn't receive an email? Check your spam folder or contact support.
            </AlertDescription>
          </Alert>

        </div>
      </div>
    </div>
  );
};

export default Login;
