"use client";

import { WeatherForm } from "@/components/weather-form";
import { WeatherLookup } from "@/components/weather-lookup";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <div className="text-center mb-12 w-full flex flex-col items-center">
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
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-4">
            Submit weather requests and retrieve stored results with our comprehensive weather data management system
          </p>
          {mounted && (
            <Button
              variant="outline"
              size="icon"
              aria-label="Toggle theme"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="mt-2"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-2 w-full max-w-4xl items-center justify-center">
          {/* Weather Form Section */}
          <div className="lg:col-span-1 flex flex-col items-center">
            <div className="w-full">
              <div className="flex items-center justify-center gap-2 mb-6 min-h-[48px]">
                <div className="w-1 h-10 bg-blue-500 rounded-full"></div>
                <h2 className="text-2xl font-semibold">Submit Weather Request</h2>
              </div>
              <WeatherForm />
            </div>
          </div>

          <div className="lg:col-span-1 flex flex-col items-center">
            <div className="w-full">
              <div className="flex items-center justify-center gap-2 mb-6 min-h-[48px]">
                <div className="w-1 h-10 bg-purple-500 rounded-full"></div>
                <h2 className="text-2xl font-semibold">Lookup Weather Data</h2>
              </div>
              <WeatherLookup />
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground w-full">
          <p>
            Built with Next.js, FastAPI, and Tailwind CSS • 
            Weather data powered by WeatherStack API
          </p>
        </div>
      </div>
    </div>
  );
}
