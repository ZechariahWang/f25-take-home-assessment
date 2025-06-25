"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Search, 
  Thermometer, 
  Wind, 
  Droplets, 
  Eye, 
  Calendar, 
  MapPin, 
  Loader2, 
  AlertCircle,
  Trash2,
  Copy,
  CheckCircle,
  Cloud,
  Sun,
  Compass
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
    humidity?: number;
    wind_speed?: number;
    pressure?: number;
    visibility?: number;
    feels_like?: number;
    uv_index?: number;
    precipitation?: number;
    cloud_cover?: number;
    wind_direction?: string;
    sunrise?: string;
    sunset?: string;
  };
  created_at?: string;
}

export function WeatherLookup() {
  const [weatherId, setWeatherId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weatherId.trim()) return;

    setIsLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const response = await fetch(`http://localhost:8000/weather/${weatherId.trim()}`);
      
      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Weather data not found");
      }
    } catch {
      setError("Network error: Could not connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!weatherData?.id) return;

    try {
      const response = await fetch(`http://localhost:8000/weather/${weatherData.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setWeatherData(null);
        setWeatherId("");
        setError(null);
      } else {
        setError("Failed to delete weather data");
      }
    } catch {
      setError("Network error: Could not delete weather data");
    }
  };

  const handleCopyId = async () => {
    if (weatherData?.id) {
      try {
        await navigator.clipboard.writeText(weatherData.id);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        const textArea = document.createElement("textarea");
        textArea.value = weatherData.id;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes("sunny") || desc.includes("clear")) return <Sun className="h-4 w-4 text-yellow-500" />;
    if (desc.includes("cloud")) return <Cloud className="h-4 w-4 text-gray-500" />;
    if (desc.includes("rain")) return <Droplets className="h-4 w-4 text-blue-500" />;
    return <Thermometer className="h-4 w-4 text-orange-500" />;
  };

  const getUVIndexColor = (uvIndex: number) => {
    if (uvIndex <= 2) return "text-green-500";
    if (uvIndex <= 5) return "text-yellow-500";
    if (uvIndex <= 7) return "text-orange-500";
    if (uvIndex <= 10) return "text-red-500";
    return "text-purple-500";
  };

  return (
    <Card className="w-full max-w-md mx-auto min-h-[400px]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
            <Search className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          Lookup Weather Data
        </CardTitle>
        <CardDescription>
          Enter a weather request ID to retrieve stored data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLookup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weatherId">Weather Request ID</Label>
            <div className="flex gap-2">
              <Input
                id="weatherId"
                type="text"
                placeholder="e.g., sample-123"
                value={weatherId}
                onChange={(e) => setWeatherId(e.target.value)}
                className={cn(
                  error && !weatherData && "border-red-500 focus:border-red-500"
                )}
                required
              />
              <Button type="submit" disabled={isLoading || !weatherId.trim()}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {weatherData && (
            <div className="space-y-4 p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  {weatherData.location}
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyId}
                    className="h-8 w-8 p-0"
                  >
                    {copied ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formatDate(weatherData.date)}
              </div>

              {/* Notes */}
              {weatherData.notes && (
                <div className="text-sm p-3 bg-white/50 dark:bg-gray-800/50 rounded-md">
                  <span className="font-medium">Notes:</span> {weatherData.notes}
                </div>
              )}

              {/* Weather Description */}
              {weatherData.weather_data.description && (
                <div className="flex items-center gap-2 text-lg font-medium">
                  {getWeatherIcon(weatherData.weather_data.description)}
                  {weatherData.weather_data.description}
                </div>
              )}

              {/* Main Weather Grid */}
              <div className="grid grid-cols-2 gap-3">
                {weatherData.weather_data.temperature !== undefined && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
                    <Thermometer className="h-4 w-4 text-orange-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {weatherData.weather_data.temperature}°C
                      </div>
                      {weatherData.weather_data.feels_like !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          Feels like {weatherData.weather_data.feels_like}°C
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {weatherData.weather_data.humidity !== undefined && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
                    <Droplets className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {weatherData.weather_data.humidity}%
                      </div>
                      <div className="text-xs text-muted-foreground">Humidity</div>
                    </div>
                  </div>
                )}

                {weatherData.weather_data.wind_speed !== undefined && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
                    <Wind className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {weatherData.weather_data.wind_speed} km/h
                      </div>
                      {weatherData.weather_data.wind_direction && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Compass className="h-3 w-3" />
                          {weatherData.weather_data.wind_direction}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {weatherData.weather_data.visibility !== undefined && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
                    <Eye className="h-4 w-4 text-purple-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {weatherData.weather_data.visibility} km
                      </div>
                      <div className="text-xs text-muted-foreground">Visibility</div>
                    </div>
                  </div>
                )}

                {weatherData.weather_data.pressure !== undefined && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
                    <div className="h-4 w-4 bg-gray-400 rounded-full" />
                    <div>
                      <div className="text-sm font-medium">
                        {weatherData.weather_data.pressure} hPa
                      </div>
                      <div className="text-xs text-muted-foreground">Pressure</div>
                    </div>
                  </div>
                )}

                {weatherData.weather_data.uv_index !== undefined && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
                    <Sun className={cn("h-4 w-4", getUVIndexColor(weatherData.weather_data.uv_index))} />
                    <div>
                      <div className="text-sm font-medium">
                        {weatherData.weather_data.uv_index}
                      </div>
                      <div className="text-xs text-muted-foreground">UV Index</div>
                    </div>
                  </div>
                )}

                {weatherData.weather_data.precipitation !== undefined && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
                    <Droplets className="h-4 w-4 text-blue-600" />
                    <div>
                      <div className="text-sm font-medium">
                        {weatherData.weather_data.precipitation} mm
                      </div>
                      <div className="text-xs text-muted-foreground">Precipitation</div>
                    </div>
                  </div>
                )}

                {weatherData.weather_data.cloud_cover !== undefined && (
                  <div className="flex items-center gap-2 p-2 bg-white/50 dark:bg-gray-800/50 rounded-md">
                    <Cloud className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {weatherData.weather_data.cloud_cover}%
                      </div>
                      <div className="text-xs text-muted-foreground">Cloud Cover</div>
                    </div>
                  </div>
                )}
              </div>

              {weatherData.created_at && (
                <div className="text-xs text-muted-foreground pt-2 border-t border-gray-200 dark:border-gray-700">
                  Created: {new Date(weatherData.created_at).toLocaleString()}
                </div>
              )}
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
} 