import { Copy, Check, FileText, Calendar, Building2, User } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { AIInvoiceData } from "@/utils/invoiceExtractor";
import { Card } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AIInvoiceDisplayProps {
  data: AIInvoiceData;
}

export const AIInvoiceDisplay = ({ data }: AIInvoiceDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopyJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast.success("Data copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "-";
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          AI-Extracted Invoice Data
        </h3>
        <Button
          onClick={handleCopyJSON}
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
              Copy JSON
            </>
          )}
        </Button>
      </div>

      {/* Invoice Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.invoice_number && (
          <Card className="p-4 bg-gradient-to-br from-primary/5 to-primary-glow/5 border-primary/20">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Invoice Number</p>
                <p className="font-semibold text-foreground">{data.invoice_number}</p>
              </div>
            </div>
          </Card>
        )}

        {data.invoice_date && (
          <Card className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Invoice Date</p>
                <p className="font-semibold text-foreground">{data.invoice_date}</p>
              </div>
            </div>
          </Card>
        )}

        {data.due_date && (
          <Card className="p-4 bg-gradient-to-br from-accent/5 to-accent/10 border-accent/20">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-accent mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Due Date</p>
                <p className="font-semibold text-foreground">{data.due_date}</p>
              </div>
            </div>
          </Card>
        )}

        {data.vendor_name && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Vendor</p>
                <p className="font-semibold text-foreground">{data.vendor_name}</p>
              </div>
            </div>
          </Card>
        )}

        {data.customer_name && (
          <Card className="p-4">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Customer</p>
                <p className="font-semibold text-foreground">{data.customer_name}</p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Line Items Table */}
      {data.line_items && data.line_items.length > 0 && (
        <Card className="overflow-hidden">
          <div className="bg-muted/50 px-6 py-3 border-b border-border">
            <h4 className="font-semibold text-foreground">Line Items</h4>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="text-center font-semibold">Quantity</TableHead>
                  <TableHead className="text-right font-semibold">Unit Price</TableHead>
                  <TableHead className="text-right font-semibold">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.line_items.map((item, index) => (
                  <TableRow key={index} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-center">{item.quantity || "-"}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals Section */}
          <div className="border-t border-border bg-gradient-to-br from-muted/30 to-muted/10 p-6">
            <div className="max-w-md ml-auto space-y-3">
              {data.subtotal !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(data.subtotal)}</span>
                </div>
              )}
              {data.discount !== undefined && data.discount > 0 && (
                <div className="flex justify-between text-sm text-accent">
                  <span>Discount:</span>
                  <span className="font-medium">-{formatCurrency(data.discount)}</span>
                </div>
              )}
              {data.tax !== undefined && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="font-medium">{formatCurrency(data.tax)}</span>
                </div>
              )}
              <div className="flex justify-between text-xl font-bold border-t-2 border-primary/30 pt-3 mt-2">
                <span className="text-foreground">Total:</span>
                <span className="text-primary">{formatCurrency(data.total)}</span>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
