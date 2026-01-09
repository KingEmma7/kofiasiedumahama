import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'Cookie policy for Kofi Asiedu Mahama website.',
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-950 py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 hover:underline mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Home
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          Cookie Policy
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2>What Are Cookies?</h2>
          <p>
            Cookies are small text files stored on your device when you visit a website. 
            They help the website remember your preferences and understand how you use 
            the site.
          </p>

          <h2>Cookies We Use</h2>

          <h3>Essential Cookies</h3>
          <p>
            These cookies are necessary for the website to function properly:
          </p>
          <ul>
            <li>Session management</li>
            <li>Theme preference (light/dark mode)</li>
            <li>Security and authentication</li>
          </ul>

          <h3>Analytics Cookies</h3>
          <p>
            We use Google Analytics to understand how visitors interact with our website. 
            This helps us improve the user experience. Data collected includes:
          </p>
          <ul>
            <li>Pages visited and time spent</li>
            <li>Referral sources</li>
            <li>Device and browser information</li>
            <li>General location (country/city level)</li>
          </ul>

          <h3>Payment Cookies</h3>
          <p>
            When you make a purchase, Paystack may use cookies to process your payment 
            securely.
          </p>

          <h2>Managing Cookies</h2>
          <p>
            Most web browsers allow you to control cookies through their settings:
          </p>
          <ul>
            <li>
              <strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies
            </li>
            <li>
              <strong>Firefox:</strong> Options &gt; Privacy &amp; Security &gt; Cookies
            </li>
            <li>
              <strong>Safari:</strong> Preferences &gt; Privacy &gt; Cookies
            </li>
          </ul>
          <p>
            Note: Disabling cookies may affect your experience on our website.
          </p>

          <h2>Contact Us</h2>
          <p>
            For questions about our cookie policy, contact us at:
            <br />
            Email: privacy@kofiasiedumahama.com
          </p>
        </div>
      </div>
    </main>
  );
}

