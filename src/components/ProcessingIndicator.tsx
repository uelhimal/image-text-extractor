import { Loader2 } from "lucide-react";
import { Progress } from "./ui/progress";

interface ProcessingIndicatorProps {
  progress: number;
  status: string;
}

export const ProcessingIndicator = ({ progress, status }: ProcessingIndicatorProps) => {
  return (
    <div className="space-y-4 p-6 rounded-xl bg-card border border-border shadow-soft">
      <div className="flex items-center gap-3">
        <Loader2 className="w-5 h-5 text-primary animate-spin" />
        <p className="text-sm font-medium text-foreground">{status}</p>
      </div>
      <Progress value={progress} className="h-2" />
      <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}%</p>
    </div>
  );
};
