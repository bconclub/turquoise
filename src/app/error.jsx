'use client';

export default function Error({ error, reset }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">We encountered an unexpected error. Please try again in a moment.</p>
          {error?.message && (
            <p className="text-sm text-gray-500 mb-4">{error.message}</p>
          )}
        </div>
        <button
          onClick={reset}
          className="px-6 py-3 bg-turquoise-600 hover:bg-turquoise-700 text-white rounded-lg font-semibold transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}


