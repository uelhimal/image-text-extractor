import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Sparkles, FileText } from "lucide-react";

interface RawTextDisplayProps {
  text: string;
  onStartAI: () => void;
  isProcessing: boolean;
}

export const RawTextDisplay = ({ text, onStartAI, isProcessing }: RawTextDisplayProps) => {
  return (
    <Card className="border-border shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-primary" />
          Extracted Raw Text
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="max-h-64 overflow-y-auto rounded-lg bg-muted/50 p-4 border border-border">
          <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
            {text}
          </pre>
        </div>
        
        <Button 
          onClick={onStartAI} 
          disabled={isProcessing}
          className="w-full gap-2 bg-gradient-primary hover:opacity-90 transition-opacity"
          size="lg"
        >
          <Sparkles className="w-5 h-5" />
          Start AI Categorization & Extraction
        </Button>
      </CardContent>
    </Card>
  );
};
