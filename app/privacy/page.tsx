import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Kofi Asiedu Mahama website and services.',
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2>1. Information We Collect</h2>
          <p>
            We collect information you provide directly, including:
          </p>
          <ul>
            <li>Name and email address when purchasing our book</li>
            <li>Email address when subscribing to our newsletter</li>
            <li>Payment information processed securely through Paystack</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            Your information is used to:
          </p>
          <ul>
            <li>Process your purchase and deliver digital products</li>
            <li>Send purchase confirmations and download links</li>
            <li>Send newsletter updates (if subscribed)</li>
            <li>Improve our website and services</li>
          </ul>

          <h2>3. Payment Security</h2>
          <p>
            All payments are processed securely through Paystack. We do not store your 
            credit card or mobile money details on our servers.
          </p>

          <h2>4. Data Retention</h2>
          <p>
            We retain your purchase information to provide ongoing access to your digital 
            products and for legal/accounting purposes. Newsletter subscribers can 
            unsubscribe at any time.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal data</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Unsubscribe from marketing communications</li>
          </ul>

          <h2>6. Cookies</h2>
          <p>
            We use essential cookies for website functionality and analytics cookies to 
            understand how visitors use our site. You can control cookies through your 
            browser settings.
          </p>

          <h2>7. Contact Us</h2>
          <p>
            For privacy-related questions, contact us at:
            <br />
            Email: privacy@kofiasiedumahama.com
          </p>
        </div>
      </div>
    </main>
  );
}

