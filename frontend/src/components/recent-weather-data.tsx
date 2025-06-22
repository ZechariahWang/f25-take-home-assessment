"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MapPin, 
  Calendar, 
  Thermometer, 
  Loader2, 
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WeatherData {
  id: string;
  date: string;
  location: string;
  notes: string;
  weather_data: {
    temperature?: number;
    description?: string;
  };
  created_at?: string;
}

export function RecentWeatherData() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/weather");

      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
        setError(null);
      } else {
        // Get more specific error information
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Failed to fetch recent weather data (Status: ${response.status})`;
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Network error: Could not connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentData();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:8000/weather/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh the data
        setError(null);
        fetchRecentData();
      } else {
        // Get more specific error information
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail || `Failed to delete weather data (Status: ${response.status})`;
        setError(errorMessage);
      }
    } catch (error) {
      console.error("Delete error:", error);
      setError("Network error: Could not connect to the server");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading && weatherData.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recent Weather Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Recent Weather Data
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRecentData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 mb-4">
            <p className="text-sm">{error}</p>
          </div>
        )}

        {weatherData.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-6 w-6" />
            </div>
            <p className="text-sm">No weather data available</p>
            <p className="text-xs mt-1">Submit a weather request to see it here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {weatherData.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                      <span className="font-medium truncate">{item.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(item.date)}
                      </div>
                      {item.weather_data.temperature !== undefined && (
                        <div className="flex items-center gap-1">
                          <Thermometer className="h-3 w-3" />
                          {item.weather_data.temperature}°C
                        </div>
                      )}
                    </div>

                    {item.weather_data.description && (
                      <p className="text-sm text-muted-foreground mb-1">
                        {item.weather_data.description}
                      </p>
                    )}

                    {item.notes && (
                      <p className="text-xs text-muted-foreground truncate">
                        "{item.notes}"
                      </p>
                    )}

                    {item.created_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatTime(item.created_at)}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-1 ml-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        // Copy ID to clipboard
                        navigator.clipboard.writeText(item.id);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 