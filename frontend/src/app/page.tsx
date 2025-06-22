import { WeatherForm } from "@/components/weather-form";
import { WeatherLookup } from "@/components/weather-lookup";
import { RecentWeatherData } from "@/components/recent-weather-data";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
              />
            </svg>
          </div>
          <h1 className="text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Weather System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Submit weather requests and retrieve stored results with our comprehensive weather data management system
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Weather Form Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-blue-500 rounded-full"></div>
                Submit Weather Request
              </h2>
              <WeatherForm />
            </div>
          </div>

          {/* Data Lookup Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-purple-500 rounded-full"></div>
                Lookup Weather Data
              </h2>
              <WeatherLookup />
            </div>
          </div>

          {/* Recent Weather Data Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-green-500 rounded-full"></div>
                Recent Weather Data
              </h2>
              <RecentWeatherData />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>
            Built with Next.js, FastAPI, and Tailwind CSS • 
            Weather data powered by WeatherStack API
          </p>
        </div>
      </div>
    </div>
  );
}
