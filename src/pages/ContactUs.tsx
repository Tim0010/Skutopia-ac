import { motion } from "framer-motion";
import { Mail, Phone, MapPin } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import PublicLayout from "@/components/PublicLayout";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner"; // Assuming you have a toast notification library like sonner

interface IFormInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export default function ContactUs() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
    // --- Placeholder for API submission ---
    console.log("Form data:", data);
    // Replace this with your actual API call
    // Example:
    // try {
    //   const response = await fetch('/api/contact', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(data),
    //   });
    //   if (!response.ok) throw new Error('Network response was not ok.');
    //   toast.success("Message sent successfully!");
    //   reset(); // Reset form on success
    // } catch (error) {
    //   console.error('Submission error:', error);
    //   toast.error("Failed to send message. Please try again.");
    // }

    // Simulate network delay for demonstration
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success("Message sent successfully! (Simulated)");
    reset();
    // --- End Placeholder ---
  };

  return (
    <PublicLayout
      title="Contact Us"
      subtitle="We're here to help. Reach out to our team with any questions or feedback."
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
        {/* Left Column: Contact Info & Hours */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">Get in Touch</h2>

          <div className="space-y-6 mb-8">
            {/* Email */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-skutopia-100 dark:bg-skutopia-900/30 p-3 rounded-full">
                <Mail className="h-6 w-6 text-skutopia-600 dark:text-skutopia-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Email</h3>
                <a href="mailto:contact@skutopia-academia.com" className="text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400 transition-colors break-all">
                  contact@skutopia-academia.com
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-skutopia-100 dark:bg-skutopia-900/30 p-3 rounded-full">
                <Phone className="h-6 w-6 text-skutopia-600 dark:text-skutopia-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Phone</h3>
                <a href="tel:+260974274991" className="block text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400 transition-colors">
                  +260 974 274 991
                </a>
                <a href="https://wa.me/919253664013" target="_blank" rel="noopener noreferrer" className="block text-gray-600 dark:text-gray-400 hover:text-skutopia-600 dark:hover:text-skutopia-400 transition-colors">
                  +91 9253664013 (WhatsApp)
                </a>
              </div>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 bg-skutopia-100 dark:bg-skutopia-900/30 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-skutopia-600 dark:text-skutopia-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Address</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Kabanana, off Mai Chola road</p>
                <p className="text-gray-600 dark:text-gray-400">Lusaka, Zambia</p>
              </div>
            </div>
          </div>

          {/* Office Hours */}
          <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-100 dark:border-gray-700/50">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Office Hours</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Monday - Friday:</span>
                <span className="font-medium text-gray-900 dark:text-white">8:00 AM - 5:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Saturday:</span>
                <span className="font-medium text-gray-900 dark:text-white">9:00 AM - 1:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sunday:</span>
                <span className="font-medium text-gray-900 dark:text-white">Closed</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6">Send a Message</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Name <span className="text-red-500">*</span>
              </label>
              <Input
                id="name"
                placeholder="John Banda"
                {...register("name", { required: "Name is required" })}
                aria-invalid={errors.name ? "true" : "false"}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                id="email"
                type="email"
                placeholder="john.banda@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: "Invalid email address" }
                })}
                aria-invalid={errors.email ? "true" : "false"}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject
              </label>
              <Input
                id="subject"
                placeholder="How can we help you?"
                {...register("subject")}
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Message <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="message"
                rows={6}
                placeholder="Your message here..."
                {...register("message", { required: "Message is required" })}
                aria-invalid={errors.message ? "true" : "false"}
                className={errors.message ? "border-red-500" : ""}
              />
              {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-skutopia-600 hover:bg-skutopia-700 rounded-full shadow-lg"
              size="lg"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </motion.div>
      </div>
    </PublicLayout>
  );
}
