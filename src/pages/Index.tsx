import { useState, useCallback } from "react";
import { createWorker } from "tesseract.js";
import { ImageUpload } from "@/components/ImageUpload";
import { ImagePreview } from "@/components/ImagePreview";
import { ProcessingIndicator } from "@/components/ProcessingIndicator";
import { InvoiceDataDisplay } from "@/components/InvoiceDataDisplay";
import { parseInvoiceText, InvoiceData } from "@/utils/invoiceParser";
import { FileText } from "lucide-react";

const Index = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [invoiceData, setInvoiceData] = useState<InvoiceData>({});

  const processImage = useCallback(async (file: File) => {
    setIsProcessing(true);
    setProgress(0);
    setExtractedText("");
    setInvoiceData({});

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
      const parsedData = parseInvoiceText(data.text);
      setInvoiceData(parsedData);
      setStatus("Text extraction complete!");
    } catch (error) {
      console.error("OCR Error:", error);
      setStatus("Error processing image");
    } finally {
      await worker.terminate();
      setIsProcessing(false);
    }
  }, []);

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
    setInvoiceData({});
    setProgress(0);
    setStatus("");
  }, [imageUrl]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-primary shadow-medium">
            <FileText className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-3 bg-gradient-primary bg-clip-text text-transparent">
            Invoice OCR Scanner
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload invoice images and extract structured data in key:value pairs
          </p>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {!imageFile && (
            <ImageUpload
              onImageSelect={handleImageSelect}
              isProcessing={isProcessing}
            />
          )}

          {imageFile && imageUrl && (
            <ImagePreview imageUrl={imageUrl} onRemove={handleRemoveImage} />
          )}

          {isProcessing && (
            <ProcessingIndicator progress={progress} status={status} />
          )}

          {extractedText && !isProcessing && (
            <InvoiceDataDisplay data={invoiceData} rawText={extractedText} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
