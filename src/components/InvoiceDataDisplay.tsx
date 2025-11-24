import { Copy, Check } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { ParsedInvoice } from "@/utils/invoiceParser";
import { Card } from "./ui/card";
import { LineItemsTable } from "./LineItemsTable";

interface InvoiceDataDisplayProps {
  parsedInvoice: ParsedInvoice;
  rawText: string;
}

export const InvoiceDataDisplay = ({ parsedInvoice, rawText }: InvoiceDataDisplayProps) => {
  const { metadata, lineItems, subtotal, discount, tax, total } = parsedInvoice;
  const [copied, setCopied] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const handleCopy = async () => {
    const textToCopy = Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    toast.success("Data copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(parsedInvoice, null, 2));
    toast.success("JSON copied to clipboard!");
  };

  const dataEntries = Object.entries(metadata);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-foreground">Extracted Invoice Data</h3>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowRaw(!showRaw)}
            variant="outline"
            size="sm"
          >
            {showRaw ? "Show Structured" : "Show Raw Text"}
          </Button>
          <Button
            onClick={handleCopyJSON}
            variant="outline"
            size="sm"
          >
            Copy JSON
          </Button>
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
      </div>

      {showRaw ? (
        <div className="p-4 rounded-xl bg-muted border border-border min-h-[200px] max-h-[500px] overflow-y-auto">
          <p className="text-sm text-foreground whitespace-pre-wrap font-mono">
            {rawText || "No text detected"}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Line Items Table */}
          <LineItemsTable
            items={lineItems}
            subtotal={subtotal}
            discount={discount}
            tax={tax}
            total={total}
          />

          {/* Metadata Fields */}
          {dataEntries.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Invoice Details</h3>
              <div className="grid gap-3">
                {dataEntries.map(([key, value]) => (
                  <Card
                    key={key}
                    className="p-4 hover:shadow-soft transition-all duration-200"
                  >
                    <div className="grid grid-cols-[140px_1fr] gap-4 items-start">
                      <div className="font-semibold text-sm text-primary">
                        {key}
                      </div>
                      <div className="text-sm text-foreground break-words">
                        {value}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {dataEntries.length === 0 && lineItems.length === 0 && (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">No structured data extracted</p>
              <Button
                onClick={() => setShowRaw(true)}
                variant="link"
                size="sm"
                className="mt-2"
              >
                View raw text instead
              </Button>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};
