import { motion } from "framer-motion";
import PublicLayout from "@/components/PublicLayout";

export default function PrivacyPolicy() {
  return (
    <PublicLayout
      title="Privacy Policy"
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
            Mentorly Academia ("we," "our," or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website, mobile applications, and services (collectively, the "Services").
          </p>
          <p>
            Please read this Privacy Policy carefully. If you do not agree with the terms of this Privacy Policy, please do not access or use our Services.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Data</h3>
          <p>
            We may collect personal data that you provide directly to us, such as:
          </p>
          <ul>
            <li>Contact information (name, email address, phone number, postal address)</li>
            <li>Account credentials (username, password)</li>
            <li>Profile information (profile picture, educational background, interests)</li>
            <li>Payment information (credit card details, billing address)</li>
            <li>Communications (messages, feedback, survey responses)</li>
            <li>Educational data (course progress, test scores, assignments)</li>
          </ul>

          <h3>2.2 Automatically Collected Information</h3>
          <p>
            When you use our Services, we may automatically collect certain information, including:
          </p>
          <ul>
            <li>Device information (IP address, browser type, operating system)</li>
            <li>Usage data (pages visited, time spent, links clicked)</li>
            <li>Location data (if you enable location services)</li>
            <li>Cookies and similar tracking technologies</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>
            We may use the information we collect for various purposes, including to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our Services</li>
            <li>Process and complete transactions</li>
            <li>Send administrative information, such as updates, security alerts, and support messages</li>
            <li>Respond to your comments, questions, and requests</li>
            <li>Personalize your experience and deliver content relevant to your interests</li>
            <li>Monitor and analyze trends, usage, and activities in connection with our Services</li>
            <li>Detect, prevent, and address technical issues, fraud, or other illegal activities</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>4. How We Share Your Information</h2>
          <p>
            We may share your information with the following categories of third parties:
          </p>
          <ul>
            <li>Service providers who perform services on our behalf (e.g., payment processing, data analysis, email delivery)</li>
            <li>Educational institutions and partners with whom we collaborate</li>
            <li>Other users, when you choose to share information publicly or with specific users</li>
            <li>Business partners, with your consent or as necessary to provide services you have requested</li>
            <li>Government authorities, if required by law or to protect our rights</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We will retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including to satisfy any legal, regulatory, accounting, or reporting requirements.
          </p>

          <h2>7. Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal data, including:
          </p>
          <ul>
            <li>The right to access your personal data</li>
            <li>The right to correct inaccurate or incomplete data</li>
            <li>The right to delete your personal data</li>
            <li>The right to restrict or object to processing</li>
            <li>The right to data portability</li>
            <li>The right to withdraw consent</li>
          </ul>
          <p>
            To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
          </p>

          <h2>8. Children's Privacy</h2>
          <p>
            Our Services are not intended for children under the age of 13. We do not knowingly collect personal data from children under 13. If you are a parent or guardian and believe that your child has provided us with personal data, please contact us, and we will take steps to delete such information.
          </p>

          <h2>9. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. If we make material changes, we will notify you by posting the updated Privacy Policy on our Services and updating the "Last updated" date. Your continued use of our Services after such notice constitutes your acceptance of the updated Privacy Policy.
          </p>

          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
          </p>
          <p>
            Mentorly Academia<br />
            123 Education Avenue<br />
            Suite 200<br />
            Email: privacy@mentorly-academia.com
          </p>
        </motion.div>
    </PublicLayout>
  );
}
