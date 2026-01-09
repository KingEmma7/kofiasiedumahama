import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of service for Kofi Asiedu Mahama website and products.',
};

export default function TermsPage() {
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
          Terms of Service
        </h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-gray-600 dark:text-gray-300">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <h2>1. Agreement to Terms</h2>
          <p>
            By accessing or using our website and purchasing our products, you agree to 
            be bound by these Terms of Service.
          </p>

          <h2>2. Digital Products</h2>
          <p>
            Upon successful payment, you receive a personal, non-transferable license to 
            access and use the digital book for personal, non-commercial purposes.
          </p>
          <ul>
            <li>You may download and store the book on your personal devices</li>
            <li>You may not redistribute, resell, or share the download link</li>
            <li>You may not remove any copyright notices or watermarks</li>
          </ul>

          <h2>3. Payment and Refunds</h2>
          <p>
            All prices are in Ghana Cedis (GHS). Payments are processed securely through 
            Paystack.
          </p>
          <p>
            Due to the digital nature of our products, all sales are final. However, if you 
            experience technical issues accessing your purchase, please contact us within 
            7 days for assistance.
          </p>

          <h2>4. Intellectual Property</h2>
          <p>
            All content, including the book text, design, and website materials, is 
            protected by copyright and other intellectual property laws. Unauthorized 
            reproduction or distribution is prohibited.
          </p>

          <h2>5. Limitation of Liability</h2>
          <p>
            The book is provided for informational purposes. While we strive to provide 
            accurate and helpful content, we are not liable for any decisions or actions 
            you take based on the information in the book.
          </p>

          <h2>6. Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be 
            posted on this page with an updated date.
          </p>

          <h2>7. Contact</h2>
          <p>
            For questions about these terms, contact us at:
            <br />
            Email: legal@kofiasiedumahama.com
          </p>
        </div>
      </div>
    </main>
  );
}

