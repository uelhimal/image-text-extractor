import { Copy, Check, FileText, Calendar, Building2, User, CreditCard, RotateCcw, Send, PoundSterling, Briefcase, Lock, Globe } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { AIInvoiceData } from "@/utils/invoiceExtractor";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DEFAULT_CATEGORIES = [
  "Advertising & Marketing",
  "Bank Charges & Fees",
  "Business Meals",
  "Client Entertainment",
  "Communication & Telecom",
  "Consulting & Professional Fees",
  "Education & Training",
  "Equipment & Tools",
  "Insurance",
  "Legal & Accounting",
  "Office Supplies",
  "Rent & Utilities",
  "Software & Subscriptions",
  "Travel & Transportation",
  "Wages & Salaries",
  "Other Expenses",
];

const CURRENCY_OPTIONS = ["GBP", "USD", "EUR", "CAD", "AUD", "INR", "JPY"];

interface ExtendedFormData extends AIInvoiceData {
  vendor?: string;
  client?: string;
  project?: string;
  category?: string;
  assigned_user?: string;
  currency?: string;
  private_notes?: string;
  public_notes?: string;
  description_comments?: string;
}

interface AIInvoiceDisplayProps {
  data: AIInvoiceData;
  onReset?: () => void;
}

// Helper function to format line items as text for public notes
const formatLineItemsAsText = (lineItems?: AIInvoiceData["line_items"]): string => {
  if (!lineItems || lineItems.length === 0) return "";
  
  return lineItems
    .map((item, index) => {
      const parts = [];
      if (item.description) parts.push(item.description);
      if (item.quantity) parts.push(`Qty: ${item.quantity}`);
      if (item.amount) parts.push(`£${item.amount.toFixed(2)}`);
      if (item.category) parts.push(`[${item.category}]`);
      return `${index + 1}. ${parts.join(" - ")}`;
    })
    .join("\n");
};

export const AIInvoiceDisplay = ({ data, onReset }: AIInvoiceDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const [editableData, setEditableData] = useState<ExtendedFormData>(() => {
    // Format line items as text for public notes
    const lineItemsText = formatLineItemsAsText(data.line_items);
    
    const baseData: ExtendedFormData = {
      ...data,
      vendor: data.vendor_name || "",
      client: data.customer_name || "",
      project: "",
      category: DEFAULT_CATEGORIES[0],
      assigned_user: "",
      currency: "GBP",
      private_notes: "",
      public_notes: lineItemsText,
      description_comments: data.notes || "",
    };
    
    return baseData;
  });
  const [categories] = useState<string[]>(DEFAULT_CATEGORIES);

  const handleCopyJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(editableData, null, 2));
    setCopied(true);
    toast.success("Data copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    const formData = {
      vendor: editableData.vendor,
      client: editableData.client,
      project: editableData.project,
      category: editableData.category,
      assigned_user: editableData.assigned_user,
      total_amount: editableData.total,
      currency: editableData.currency,
      date: editableData.invoice_date,
      private_notes: editableData.private_notes,
      public_notes: editableData.public_notes,
      description_comments: editableData.description_comments,
    };
    console.log("Form Data:", formData);
    toast.success("Form data logged to console!");
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "";
    return value.toFixed(2);
  };

  const updateField = (field: keyof ExtendedFormData, value: string | number | undefined) => {
    setEditableData(prev => ({ ...prev, [field]: value }));
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

      {/* Invoice Form Fields */}
      <Card className="p-6">
        <h4 className="font-semibold text-foreground mb-4">Invoice Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="vendor" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-primary" />
              Vendor
            </Label>
            <Input
              id="vendor"
              value={editableData.vendor || ""}
              onChange={(e) => updateField("vendor", e.target.value)}
              placeholder="Enter vendor name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client" className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Client
            </Label>
            <Input
              id="client"
              value={editableData.client || ""}
              onChange={(e) => updateField("client", e.target.value)}
              placeholder="Enter client name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="project" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-primary" />
              Project Selection
            </Label>
            <Input
              id="project"
              value={editableData.project || ""}
              onChange={(e) => updateField("project", e.target.value)}
              placeholder="Enter project name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Category
            </Label>
            <Select
              value={editableData.category || DEFAULT_CATEGORIES[0]}
              onValueChange={(value) => updateField("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="assigned_user" className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Assigned User
            </Label>
            <Input
              id="assigned_user"
              value={editableData.assigned_user || ""}
              onChange={(e) => updateField("assigned_user", e.target.value)}
              placeholder="Enter assigned user"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_amount" className="flex items-center gap-2">
              <PoundSterling className="w-4 h-4 text-primary" />
              Total Amount
            </Label>
            <Input
              id="total_amount"
              type="number"
              step="0.01"
              value={formatCurrency(editableData.total)}
              onChange={(e) => updateField("total", e.target.value ? parseFloat(e.target.value) : undefined)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Currency
            </Label>
            <Select
              value={editableData.currency || "USD"}
              onValueChange={(value) => updateField("currency", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="bg-popover border border-border z-50">
                {CURRENCY_OPTIONS.map((currency) => (
                  <SelectItem key={currency} value={currency}>
                    {currency}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Date
            </Label>
            <Input
              id="date"
              value={editableData.invoice_date || ""}
              onChange={(e) => updateField("invoice_date", e.target.value)}
              placeholder="Enter date"
            />
          </div>
        </div>

        {/* Description & Comments Textarea */}
        <div className="mt-4 space-y-2">
          <Label htmlFor="description_comments" className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Invoice Description & Comments
          </Label>
          <Textarea
            id="description_comments"
            value={editableData.description_comments || ""}
            onChange={(e) => updateField("description_comments", e.target.value)}
            placeholder="Enter invoice description and comments..."
            rows={3}
          />
        </div>

        {/* Notes Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="private_notes" className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-muted-foreground" />
              Private Notes
            </Label>
            <Textarea
              id="private_notes"
              value={editableData.private_notes || ""}
              onChange={(e) => updateField("private_notes", e.target.value)}
              placeholder="Enter private notes (internal use only)..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="public_notes" className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Public Notes
            </Label>
            <Textarea
              id="public_notes"
              value={editableData.public_notes || ""}
              onChange={(e) => updateField("public_notes", e.target.value)}
              placeholder="Enter public notes (visible to client)..."
              rows={3}
            />
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pt-4">
        {onReset && (
          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Another Image
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          size="lg"
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          Submit
        </Button>
      </div>
    </div>
  );
};