import { useState, useEffect } from "react";
import { Loader2, Brain, Sparkles, CheckCircle2 } from "lucide-react";
import { Progress } from "./ui/progress";
import { Card, CardContent } from "./ui/card";

interface AIProcessingIndicatorProps {
  duration?: number; // in seconds
}

const processingSteps = [
  { label: "Analyzing document structure...", icon: Brain },
  { label: "Identifying line items...", icon: Sparkles },
  { label: "Categorizing expenses...", icon: Brain },
  { label: "Extracting financial data...", icon: Sparkles },
  { label: "Validating calculations...", icon: CheckCircle2 },
];

export const AIProcessingIndicator = ({ duration = 30 }: AIProcessingIndicatorProps) => {
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const stepDuration = (duration * 1000) / processingSteps.length;
    const progressInterval = 50; // Update every 50ms for smooth animation
    const progressIncrement = 100 / ((duration * 1000) / progressInterval);

    const progressTimer = setInterval(() => {
      setProgress((prev) => Math.min(prev + progressIncrement, 100));
    }, progressInterval);

    const stepTimer = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, processingSteps.length - 1));
    }, stepDuration);

    return () => {
      clearInterval(progressTimer);
      clearInterval(stepTimer);
    };
  }, [duration]);

  const CurrentIcon = processingSteps[currentStep].icon;

  return (
    <Card className="border-border shadow-soft overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
      <CardContent className="relative p-8">
        <div className="flex flex-col items-center text-center space-y-6">
          {/* Animated Icon */}
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center">
              <CurrentIcon className="w-10 h-10 text-primary-foreground animate-pulse" />
            </div>
            <Loader2 className="absolute -top-2 -right-2 w-8 h-8 text-primary animate-spin" />
          </div>

          {/* Status Text */}
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              AI Processing Invoice
            </h3>
            <p className="text-muted-foreground animate-pulse">
              {processingSteps[currentStep].label}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md space-y-2">
            <Progress value={progress} className="h-3" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Step {currentStep + 1} of {processingSteps.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex gap-2">
            {processingSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? "bg-primary scale-110" 
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
