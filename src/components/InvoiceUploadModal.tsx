import { useState, useCallback } from "react";
import { createWorker } from "tesseract.js";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePreview } from "@/components/ImagePreview";
import { ProcessingIndicator } from "@/components/ProcessingIndicator";
import { RawTextDisplay } from "@/components/RawTextDisplay";
import { AIProcessingIndicator } from "@/components/AIProcessingIndicator";
import { AIInvoiceDisplay } from "@/components/AIInvoiceDisplay";
import { extractInvoiceWithAI, AIInvoiceData } from "@/utils/invoiceExtractor";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ProcessingStage = "idle" | "ocr" | "ocr-complete" | "ai-processing" | "complete";

interface InvoiceUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const InvoiceUploadModal = ({ open, onOpenChange }: InvoiceUploadModalProps) => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [stage, setStage] = useState<ProcessingStage>("idle");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [aiInvoiceData, setAiInvoiceData] = useState<AIInvoiceData | null>(null);

  const processImage = useCallback(async (file: File) => {
    setStage("ocr");
    setProgress(0);
    setExtractedText("");
    setAiInvoiceData(null);

    const worker = await createWorker("eng", 1, {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(m.progress * 100);
          setStatus(`Recognizing text... ${Math.round(m.progress * 100)}%`);
        } else {
          setStatus(m.status);
        }
      },
    });

    try {
      const { data } = await worker.recognize(file);
      setExtractedText(data.text);
      setStatus("OCR complete!");
      setProgress(100);
      setStage("ocr-complete");
      toast.success("Text extracted successfully! Click the button to start AI categorization.");
    } catch (error) {
      console.error("OCR Error:", error);
      setStatus("Error processing image");
      toast.error("Failed to process image");
      setStage("idle");
    } finally {
      await worker.terminate();
    }
  }, []);

  const startAIExtraction = useCallback(async () => {
    if (!extractedText) return;
    
    setStage("ai-processing");
    
    const startTime = Date.now();
    const minDisplayTime = 30000;

    try {
      const aiData = await extractInvoiceWithAI(extractedText);
      
      const elapsed = Date.now() - startTime;
      if (elapsed < minDisplayTime) {
        await new Promise(resolve => setTimeout(resolve, minDisplayTime - elapsed));
      }
      
      setAiInvoiceData(aiData);
      setStage("complete");
      toast.success("Invoice data extracted and categorized successfully!");
    } catch (aiError: any) {
      console.error("AI extraction error:", aiError);
      
      if (aiError.message?.includes("Rate limit")) {
        toast.error("Rate limit exceeded. Please try again in a moment.");
      } else if (aiError.message?.includes("credits")) {
        toast.error("AI credits exhausted. Please add credits to continue.");
      } else {
        toast.error("Failed to extract invoice data with AI");
      }
      
      setStage("ocr-complete");
    }
  }, [extractedText]);

  const handleImageSelect = useCallback(
    (file: File) => {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      processImage(file);
    },
    [processImage]
  );

  const handleRemoveImage = useCallback(() => {
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    setImageFile(null);
    setImageUrl("");
    setExtractedText("");
    setAiInvoiceData(null);
    setProgress(0);
    setStatus("");
    setStage("idle");
  }, [imageUrl]);

  const handleClose = () => {
    handleRemoveImage();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Upload Invoice</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {stage === "idle" && !imageFile && (
            <ImageUpload
              onImageSelect={handleImageSelect}
              isProcessing={false}
            />
          )}

          {imageFile && imageUrl && stage !== "complete" && (
            <ImagePreview imageUrl={imageUrl} onRemove={handleRemoveImage} />
          )}

          {stage === "ocr" && (
            <ProcessingIndicator progress={progress} status={status} />
          )}

          {stage === "ocr-complete" && extractedText && (
            <RawTextDisplay 
              text={extractedText} 
              onStartAI={startAIExtraction}
              isProcessing={false}
            />
          )}

          {stage === "ai-processing" && (
            <AIProcessingIndicator duration={30} />
          )}

          {stage === "complete" && aiInvoiceData && (
            <AIInvoiceDisplay data={aiInvoiceData} onReset={handleRemoveImage} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};