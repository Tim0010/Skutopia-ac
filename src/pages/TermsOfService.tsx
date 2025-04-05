import { motion } from "framer-motion";
import PublicLayout from "@/components/PublicLayout";

export default function TermsOfService() {
  return (
    <PublicLayout
      title="Terms of Service"
      subtitle="Last updated: January 1, 2023"
    >

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          <h2>1. Introduction</h2>
          <p>
            Welcome to Mentorly Academia ("we," "our," or "us"). These Terms of Service ("Terms") govern your access to and use of the Mentorly Academia website, mobile applications, and services (collectively, the "Services").
          </p>
          <p>
            By accessing or using our Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.
          </p>

          <h2>2. Eligibility</h2>
          <p>
            You must be at least 13 years old to use our Services. If you are under 13, you must have permission from a parent or guardian to use our Services, and they must agree to these Terms on your behalf.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            To access certain features of our Services, you may need to register for an account. When you register, you agree to provide accurate, current, and complete information about yourself and to update this information to keep it accurate, current, and complete.
          </p>
          <p>
            You are responsible for safeguarding your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.
          </p>

          <h2>4. User Content</h2>
          <p>
            Our Services may allow you to post, upload, or submit content, including text, photos, videos, and other materials ("User Content"). You retain ownership of any intellectual property rights you hold in the User Content.
          </p>
          <p>
            By posting User Content, you grant us a non-exclusive, royalty-free, worldwide, perpetual, and irrevocable right to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such User Content in connection with our Services.
          </p>

          <h2>5. Prohibited Conduct</h2>
          <p>
            You agree not to:
          </p>
          <ul>
            <li>Use our Services for any illegal purpose or in violation of any laws or regulations</li>
            <li>Post or transmit any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable</li>
            <li>Impersonate any person or entity or falsely state or misrepresent your affiliation with a person or entity</li>
            <li>Interfere with or disrupt the Services or servers or networks connected to the Services</li>
            <li>Attempt to gain unauthorized access to any part of the Services</li>
            <li>Use any robot, spider, scraper, or other automated means to access the Services</li>
            <li>Collect or harvest any personally identifiable information from other users</li>
          </ul>

          <h2>6. Intellectual Property</h2>
          <p>
            The Services and their contents, features, and functionality are owned by Mentorly Academia and are protected by copyright, trademark, and other intellectual property laws. You may not use, reproduce, distribute, modify, or create derivative works of our Services or any content contained therein without our express written consent.
          </p>

          <h2>7. Termination</h2>
          <p>
            We may terminate or suspend your access to our Services immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Services will cease immediately.
          </p>

          <h2>8. Disclaimer of Warranties</h2>
          <p>
            THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING, BUT NOT LIMITED TO, IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            IN NO EVENT SHALL MENTORLY ACADEMIA BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, RESULTING FROM YOUR ACCESS TO OR USE OF OR INABILITY TO ACCESS OR USE THE SERVICES.
          </p>

          <h2>10. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of Zambia, without regard to its conflict of law provisions.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. If we make changes, we will provide notice by posting the updated Terms on our Services and updating the "Last updated" date. Your continued use of our Services after such notice constitutes your acceptance of the updated Terms.
          </p>

          <h2>12. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
          </p>
          <p>
            Mentorly Academia<br />
            123 Education Avenue<br />
            Suite 200<br />
            Email: contact@mentorly-academia.com
          </p>
        </motion.div>
    </PublicLayout>
  );
}
