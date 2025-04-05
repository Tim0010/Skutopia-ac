import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield } from "lucide-react";

interface FormData {
  email: string;
  password: string;
}

const Login = () => {
  const { login, user, isAdmin, loading: authLoading } = useAuth();
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

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);

    try {
      await login(data.email, data.password);
      // No explicit navigation here; useEffect handles it when user state updates
      console.log("Login submitted, waiting for user state update...");
    } catch (err: any) {
      // Handle specific Supabase auth errors if possible
      if (err.message.includes('Invalid login credentials')) {
        setError("Invalid email or password. Please try again.");
      } else {
        setError("An unexpected error occurred during login.");
      }
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center">
          <Logo className="h-12 w-auto" />
        </Link>
        <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h1>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{" "}
          <Link to="/signup" className="font-medium text-skutopia-600 hover:text-skutopia-500">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
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
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
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
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-skutopia-600 focus:ring-skutopia-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
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
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </div>
          </form>

          {/* Admin Login Info Card */}
          <div className="mt-6 border-t pt-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-2">
                <Shield className="h-5 w-5 text-blue-700 mr-2" />
                <h3 className="text-sm font-medium text-blue-900">Admin Account</h3>
              </div>
              <p className="text-xs text-blue-700 mb-2">
                You can login with the admin test account:
              </p>
              <div className="bg-white p-2 rounded border border-blue-200">
                <p className="text-xs text-gray-700 mb-1"><span className="font-semibold">Email:</span> admin@example.com</p>
                <p className="text-xs text-gray-700"><span className="font-semibold">Password:</span> admin123</p>
              </div>
              <p className="text-xs text-blue-700 mt-2">
                The admin dashboard provides full content management capabilities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
