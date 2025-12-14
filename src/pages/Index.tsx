import { useState } from "react";
import { InvoiceUploadModal } from "@/components/InvoiceUploadModal";
import { FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [modalOpen, setModalOpen] = useState(false);

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

        {/* Upload Button */}
        <div className="flex justify-center">
          <Button
            onClick={() => setModalOpen(true)}
            size="lg"
            className="gap-2 text-lg px-8 py-6"
          >
            <Upload className="w-5 h-5" />
            Upload Invoice
          </Button>
        </div>

        {/* Modal */}
        <InvoiceUploadModal open={modalOpen} onOpenChange={setModalOpen} />
      </div>
    </div>
  );
};

export default Index;