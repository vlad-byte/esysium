import Link from "next/link"

export const LandingPage = () => {

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 dark:from-blue-950 dark:via-purple-950 dark:to-black transition-colors duration-700">
      <main className="flex flex-col items-center gap-8 px-4 py-24">
        <h1 className="text-5xl sm:text-7xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-lg tracking-tight animate-fade-in">
          Elysium
        </h1>
        <p className="mt-4 text-xl sm:text-2xl text-white/90 max-w-2xl text-center animate-fade-in delay-100">
          Unlock Knowledge with <span className="text-blue-400">AI-Powered Interviews</span>
        </p>
        <Link href="/catalog">
          <button className="mt-8 px-8 py-3 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white font-semibold text-lg shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400 animate-fade-in delay-200">
            Explore Catalog
          </button>
        </Link>
      </main>
    </div>
    )
}