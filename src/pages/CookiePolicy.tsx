import { motion } from "framer-motion";
import PublicLayout from "@/components/PublicLayout";

export default function CookiePolicy() {
  return (
    <PublicLayout
      title="Cookie Policy"
      subtitle="Last updated: March 30, 2025"
    >

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          <h2>1. Introduction</h2>
          <p>
            This Cookie Policy explains how Mentorly Academia ("we," "our," or "us") uses cookies and similar technologies on our website, mobile applications, and services (collectively, the "Services"). This policy provides you with information about how we use cookies, what types of cookies we use, and how you can control them.
          </p>

          <h2>2. What Are Cookies?</h2>
          <p>
            Cookies are small text files that are stored on your device (computer, tablet, or mobile phone) when you visit a website. They are widely used to make websites work more efficiently, provide a better user experience, and give website owners information about how their site is being used.
          </p>
          <p>
            Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your device when you go offline, while session cookies are deleted as soon as you close your web browser.
          </p>

          <h2>3. Types of Cookies We Use</h2>
          <p>
            We use the following types of cookies on our Services:
          </p>

          <h3>3.1 Essential Cookies</h3>
          <p>
            These cookies are necessary for our Services to function properly. They enable basic functions like page navigation, secure areas access, and account authentication. The Services cannot function properly without these cookies.
          </p>

          <h3>3.2 Preference Cookies</h3>
          <p>
            These cookies allow our Services to remember choices you make (such as your language preference or the region you are in) and provide enhanced, personalized features. They may be set by us or by third-party providers whose services we have added to our pages.
          </p>

          <h3>3.3 Analytics Cookies</h3>
          <p>
            These cookies help us understand how visitors interact with our Services by collecting and reporting information anonymously. They allow us to recognize and count the number of visitors and see how visitors move around our Services when they are using them.
          </p>

          <h3>3.4 Marketing Cookies</h3>
          <p>
            These cookies are used to track visitors across websites. They are set to display targeted advertisements based on your interests and online behavior. They also help measure the effectiveness of advertising campaigns.
          </p>

          <h2>4. Third-Party Cookies</h2>
          <p>
            In addition to our own cookies, we may also use various third-party cookies to report usage statistics, deliver advertisements, and so on. These cookies may include:
          </p>
          <ul>
            <li>Google Analytics cookies for website analytics</li>
            <li>Social media cookies for sharing and engagement features</li>
            <li>Payment processor cookies for transaction processing</li>
            <li>Advertising network cookies for targeted advertising</li>
          </ul>

          <h2>5. How to Control Cookies</h2>
          <p>
            You can control and manage cookies in various ways. Please keep in mind that removing or blocking cookies may impact your user experience and parts of our Services may no longer be fully accessible.
          </p>

          <h3>5.1 Browser Controls</h3>
          <p>
            Most browsers allow you to view, manage, delete, and block cookies through your browser settings. To do this, follow the instructions provided by your browser (usually located within the "Help," "Tools," or "Edit" menu). Please note that if you set your browser to block cookies, you may not be able to access certain features of our Services.
          </p>

          <h3>5.2 Cookie Consent Tool</h3>
          <p>
            When you first visit our Services, you may be presented with a cookie banner that allows you to accept or decline non-essential cookies. You can change your preferences at any time by clicking on the "Cookie Settings" link in the footer of our website.
          </p>

          <h3>5.3 Do Not Track</h3>
          <p>
            Some browsers have a "Do Not Track" feature that signals to websites that you do not want to have your online activities tracked. Our Services do not currently respond to "Do Not Track" signals.
          </p>

          <h2>6. Updates to This Cookie Policy</h2>
          <p>
            We may update this Cookie Policy from time to time to reflect changes in technology, regulation, or our business practices. If we make material changes, we will notify you by posting the updated policy on our Services and updating the "Last updated" date. Your continued use of our Services after such notice constitutes your acceptance of the updated Cookie Policy.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            If you have any questions about this Cookie Policy or our use of cookies, please contact us at:
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
