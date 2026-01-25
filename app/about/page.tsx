import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About Kofi Asiedu-Mahama | Author & Thought Leader',
  description: 'Learn about Kofi Asiedu-Mahama, a business strategist, social psychologist, and governance professional with over a decade of experience in education, consulting, and enterprise development.',
  openGraph: {
    title: 'About Kofi Asiedu-Mahama',
    description: 'Business strategist, social psychologist, and governance professional dedicated to sustainable wealth creation.',
    type: 'profile',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-hidden">
      {/* Header with back button and theme toggle */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-medium">Back to Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section - Full width with diagonal split */}
        <section className="relative min-h-[90vh] flex items-center overflow-hidden">
          {/* Diagonal background split */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 dark:from-primary-950 dark:via-primary-900 dark:to-black" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-gold-500/10" />
          </div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Image - Takes up 5 columns, positioned creatively */}
              <div className="lg:col-span-5 relative">
                <div className="relative w-full max-w-md mx-auto lg:mx-0">
                  {/* Decorative frame effect */}
                  <div className="absolute -inset-4 bg-gradient-to-br from-gold-400/20 to-primary-400/20 rounded-3xl blur-2xl -z-10" />
                  <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl ring-4 ring-white/10 dark:ring-gray-800/50 bg-gray-200 dark:bg-gray-700">
                    <Image
                      src="/images/kofi-suit2.png"
                      alt="Kofi Asiedu-Mahama"
                      fill
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  {/* Floating badge */}
                  <div className="absolute -bottom-6 -right-6 bg-gold-500 dark:bg-gold-600 text-white px-6 py-3 rounded-full shadow-xl transform rotate-3 z-10">
                    <span className="text-sm font-bold">10+ Years Experience</span>
                  </div>
                </div>
              </div>

              {/* Content - Takes up 7 columns */}
              <div className="lg:col-span-7 text-white space-y-6">
                <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-sm font-semibold mb-4">
                  About the Author
                </div>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight">
                  Kofi Asiedu-Mahama
                </h1>
                <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-2xl">
                  Business strategist, student social psychologist, and governance and risk professional with over a decade of experience across education, consulting, and enterprise development.
                </p>
                <p className="text-lg text-white/80 leading-relaxed max-w-2xl">
                  His work focuses on the intersection of psychology, decision-making, wealth creation, and institutional sustainability in emerging economies.
                </p>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </section>

        {/* Education Section - Asymmetric layout */}
        <section className="relative py-20 md:py-32 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
              {/* Left side - Icon and title */}
              <div className="lg:col-span-4">
                <div className="sticky top-24">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white shadow-xl mb-6">
                    <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
                    Education
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg">
                    A multidisciplinary academic background that informs his approach to understanding financial behavior, leadership dynamics, and long-term value creation.
                  </p>
                </div>
              </div>

              {/* Right side - Credentials */}
              <div className="lg:col-span-8 space-y-6">
                <div className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                          Master of Philosophy (MPhil) in Social Psychology
                        </h3>
                        <span className="inline-block px-3 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                          In Progress
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-100 dark:bg-gold-900/20 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-gold-600 dark:bg-gold-400 mt-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          Master of Business Administration (MBA)
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">International Business</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-primary-600 dark:bg-primary-400 mt-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          Bachelor of Science in Psychology
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gold-100 dark:bg-gold-900/20 rounded-full blur-3xl opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative">
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-gold-600 dark:bg-gold-400 mt-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                          Diploma in Human Resource Management
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Experience - Timeline style */}
        <section className="relative py-20 md:py-32 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 text-white shadow-xl mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
                Professional Journey
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Over a decade of hands-on experience in consulting, education management, and organizational leadership
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
              <div className="relative pl-12 border-l-4 border-primary-500 dark:border-primary-400">
                <div className="absolute -left-[18px] top-0 w-10 h-10 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Lead Consultant
                    </h3>
                    <span className="px-4 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                      UNIWIZ Foundation
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Strategic consulting and institutional development
                  </p>
                </div>
              </div>

              <div className="relative pl-12 border-l-4 border-gold-500 dark:border-gold-400">
                <div className="absolute -left-[18px] top-0 w-10 h-10 bg-gold-600 dark:bg-gold-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Associate Director
                    </h3>
                    <span className="px-4 py-1 bg-gold-100 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300 rounded-full text-sm font-medium">
                      International Certification Centre
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400">
                    Leadership in certification and professional development
                  </p>
                </div>
              </div>

              <div className="relative pl-12 border-l-4 border-primary-500 dark:border-primary-400">
                <div className="absolute -left-[18px] top-0 w-10 h-10 bg-primary-600 dark:bg-primary-500 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Managing Director
                    </h3>
                    <span className="px-4 py-1 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-sm font-medium">
                      Lyon Child School Complex
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    Immediate Past Managing Director - Strategic growth, institutional development, and governance structures
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Personal Initiatives - Card grid with creative layout */}
        <section className="relative py-20 md:py-32 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 text-white shadow-xl mb-6">
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-4">
                Personal Initiatives
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Driving force behind practical enterprise building and thought leadership
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 dark:from-primary-500 dark:to-primary-600 p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3">CONStrAct</h3>
                  <p className="text-white/90 leading-relaxed">
                    A procurement and enterprise platform
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gold-500 to-gold-600 dark:from-gold-600 dark:to-gold-700 p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3">Transforming Lives</h3>
                  <p className="text-white/90 leading-relaxed">
                    A thought-leadership and mindset development project
                  </p>
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-700 to-primary-800 dark:from-primary-600 dark:to-primary-700 p-8 text-white shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-3">K. Asiedu-Mahama Construction</h3>
                  <p className="text-white/90 leading-relaxed">
                    Practical enterprise building and construction services
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Book Philosophy - Full width with quote style */}
        <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 dark:from-black dark:via-primary-950 dark:to-primary-900 text-white overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gold-500 dark:bg-gold-600 text-white shadow-xl mb-8">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-8">
              The Psychology of Sustainable Wealth
            </h2>
            <blockquote className="text-2xl md:text-3xl text-white/90 leading-relaxed mb-12 italic max-w-3xl mx-auto">
              &ldquo;Lasting wealth is built through disciplined thinking, sound strategy, and intentional execution—grounded in both global principles and local realities.&rdquo;
            </blockquote>
            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center">
              <Link
                href="/book"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gold-500 hover:bg-gold-600 dark:bg-gold-600 dark:hover:bg-gold-700 text-white rounded-lg font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Explore the Book
                <ArrowLeftIcon className="w-5 h-5 rotate-180" />
              </Link>
              <Link
                href="/book#payment"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold text-lg transition-all duration-200 border border-white/20"
              >
                Buy Now
              </Link>
              <Link
                href="/research"
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-semibold text-lg transition-all duration-200 border border-white/20"
              >
                My Research Papers
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
