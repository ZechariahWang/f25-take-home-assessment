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
import { CalendarIcon, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "./ui/textarea";
import { cn } from "@/lib/utils";

interface WeatherFormData {
  date: string;
  location: string;
  notes: string;
}

interface FormErrors {
  date?: string;
  location?: string;
  notes?: string;
}

function formatDateForDisplay(date: Date | undefined): string {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateForAPI(date: Date | undefined): string {
  if (!date) return "";
  return date.toISOString().split("T")[0];
}

function isValidDate(date: Date | undefined): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

function validateForm(data: WeatherFormData): FormErrors {
  const errors: FormErrors = {};

  // Date validation
  if (!data.date) {
    errors.date = "Date is required";
  } else {
    const selectedDate = new Date(data.date);
    if (isNaN(selectedDate.getTime())) {
      errors.date = "Invalid date format";
    }
  }

  // Location validation
  if (!data.location.trim()) {
    errors.location = "Location is required";
  } else if (data.location.trim().length < 2) {
    errors.location = "Location must be at least 2 characters";
  }

  // Notes validation
  if (data.notes && data.notes.length > 500) {
    errors.notes = "Notes cannot exceed 500 characters";
  }

  return errors;
}

export function WeatherForm() {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [calendarMonth, setCalendarMonth] = useState<Date | undefined>(
    new Date(),
  );
  const [displayValue, setDisplayValue] = useState(
    formatDateForDisplay(new Date()),
  );

  const [formData, setFormData] = useState<WeatherFormData>({
    date: formatDateForAPI(new Date()),
    location: "",
    notes: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    id?: string;
  } | null>(null);

  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    setDisplayValue(formatDateForDisplay(date));
    setFormData((prev) => ({
      ...prev,
      date: formatDateForAPI(date),
    }));
    setCalendarOpen(false);
    
    // Clear date error if valid
    if (date && isValidDate(date)) {
      setErrors((prev) => ({ ...prev, date: undefined }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    const parsedDate = new Date(inputValue);
    if (isValidDate(parsedDate)) {
      setSelectedDate(parsedDate);
      setCalendarMonth(parsedDate);
      setFormData((prev) => ({
        ...prev,
        date: formatDateForAPI(parsedDate),
      }));
      setErrors((prev) => ({ ...prev, date: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm(formData);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/weather", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: "Weather request submitted successfully!",
          id: data.id,
        });
        
        // Reset form after successful submission
        const today = new Date();
        setSelectedDate(today);
        setDisplayValue(formatDateForDisplay(today));
        setFormData({
          date: formatDateForAPI(today),
          location: "",
          notes: "",
        });
        setErrors({});
      } else {
        setResult({
          success: false,
          message: data.detail || "Failed to submit weather request",
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Network error: Could not connect to the server",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.location.trim().length >= 2 && 
                     formData.date && 
                     (!formData.notes || formData.notes.length <= 500);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          Weather Data Request
        </CardTitle>
        <CardDescription>
          Submit a weather data request for a specific location and date
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col gap-3">
            <Label htmlFor="date" className="px-1">
              Date <span className="text-red-500">*</span>
            </Label>
            <div className="relative flex gap-2">
              <Input
                id="date"
                value={displayValue}
                placeholder="Select a date"
                className={cn(
                  "bg-background pr-10",
                  errors.date && "border-red-500 focus:border-red-500"
                )}
                onChange={handleDateInputChange}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setCalendarOpen(true);
                  }
                }}
                required
              />
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    className="absolute top-1/2 right-2 size-6 -translate-y-1/2"
                  >
                    <CalendarIcon className="size-3.5" />
                    <span className="sr-only">Select date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="end"
                  alignOffset={-8}
                  sideOffset={10}
                >
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    captionLayout="dropdown"
                    month={calendarMonth}
                    onMonthChange={setCalendarMonth}
                    onSelect={handleDateChange}
                  />
                </PopoverContent>
              </Popover>
            </div>
            {errors.date && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.date}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="location"
              name="location"
              type="text"
              placeholder="e.g., New York, London, Tokyo"
              value={formData.location}
              onChange={handleInputChange}
              className={cn(
                errors.location && "border-red-500 focus:border-red-500"
              )}
              required
            />
            {errors.location && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.location}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">
              Notes <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <div className="relative">
              <Textarea
                id="notes"
                name="notes"
                rows={3}
                placeholder="Any additional notes about this weather request..."
                value={formData.notes}
                onChange={handleInputChange}
                className={cn(
                  "resize-none",
                  errors.notes && "border-red-500 focus:border-red-500"
                )}
              />
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {formData.notes.length}/500
              </div>
            </div>
            {errors.notes && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.notes}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !isFormValid}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Weather Request"
            )}
          </Button>

          {result && (
            <div
              className={cn(
                "p-4 rounded-md border flex items-start gap-3",
                result.success
                  ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800"
              )}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{result.message}</p>
                {result.success && result.id && (
                  <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded text-xs">
                    <p className="font-medium">Your weather request ID:</p>
                    <code className="bg-green-200 dark:bg-green-800 px-2 py-1 rounded font-mono">
                      {result.id}
                    </code>
                  </div>
                )}
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
