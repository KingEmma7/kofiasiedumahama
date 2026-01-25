import Link from 'next/link';
import { HomeIcon, BookOpenIcon, UserCircleIcon } from '@heroicons/react/24/outline';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl md:text-9xl font-bold text-primary-600 dark:text-primary-400 mb-2">
          404
        </h1>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Page not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          This page doesn&apos;t exist or has been moved. Here are some helpful links:
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary inline-flex items-center justify-center gap-2">
            <HomeIcon className="w-5 h-5" />
            Home
          </Link>
          <Link href="/book" className="btn-secondary inline-flex items-center justify-center gap-2">
            <BookOpenIcon className="w-5 h-5" />
            The Book
          </Link>
          <Link href="/about" className="btn-secondary inline-flex items-center justify-center gap-2">
            <UserCircleIcon className="w-5 h-5" />
            About
          </Link>
        </div>
      </div>
    </div>
  );
}

