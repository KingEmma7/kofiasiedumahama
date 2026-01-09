export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950">
      <div className="text-center">
        {/* Animated logo/spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-primary-200 dark:border-primary-800 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full animate-spin" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}

