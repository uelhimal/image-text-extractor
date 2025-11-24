import { Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface TextResultProps {
  text: string;
}

export const TextResult = ({ text }: TextResultProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Text copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Extracted Text</h3>
        <Button
          onClick={handleCopy}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy
            </>
          )}
        </Button>
      </div>
      <div className="p-4 rounded-xl bg-muted border border-border min-h-[200px] max-h-[400px] overflow-y-auto">
        <p className="text-sm text-foreground whitespace-pre-wrap font-mono">
          {text || "No text detected"}
        </p>
      </div>
    </div>
  );
};
