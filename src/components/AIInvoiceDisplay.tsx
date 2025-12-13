import { Copy, Check, FileText, Calendar, Building2, User, CreditCard, Tag, StickyNote, RotateCcw, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { AIInvoiceData, AILineItem } from "@/utils/invoiceExtractor";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

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

interface AIInvoiceDisplayProps {
  data: AIInvoiceData;
  onReset?: () => void;
}

export const AIInvoiceDisplay = ({ data, onReset }: AIInvoiceDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const [editableData, setEditableData] = useState<AIInvoiceData>(data);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCopyJSON = async () => {
    await navigator.clipboard.writeText(JSON.stringify(editableData, null, 2));
    setCopied(true);
    toast.success("Data copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "";
    return value.toFixed(2);
  };

  const updateField = (field: keyof AIInvoiceData, value: string | number | undefined) => {
    setEditableData(prev => ({ ...prev, [field]: value }));
  };

  const updateLineItem = (index: number, field: keyof AILineItem, value: string | number | undefined) => {
    setEditableData(prev => ({
      ...prev,
      line_items: prev.line_items?.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories(prev => [...prev, newCategory.trim()]);
      toast.success(`Category "${newCategory.trim()}" added!`);
      setNewCategory("");
      setDialogOpen(false);
    }
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

      {/* Invoice Metadata Form */}
      <Card className="p-6">
        <h4 className="font-semibold text-foreground mb-4">Invoice Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="invoice_number" className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Invoice Number
            </Label>
            <Input
              id="invoice_number"
              value={editableData.invoice_number || ""}
              onChange={(e) => updateField("invoice_number", e.target.value)}
              placeholder="Enter invoice number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice_date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              Invoice Date
            </Label>
            <Input
              id="invoice_date"
              value={editableData.invoice_date || ""}
              onChange={(e) => updateField("invoice_date", e.target.value)}
              placeholder="Enter invoice date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invoice_time" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              Invoice Time
            </Label>
            <Input
              id="invoice_time"
              value={editableData.invoice_time || ""}
              onChange={(e) => updateField("invoice_time", e.target.value)}
              placeholder="Enter invoice time"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="due_date" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              Due Date
            </Label>
            <Input
              id="due_date"
              value={editableData.due_date || ""}
              onChange={(e) => updateField("due_date", e.target.value)}
              placeholder="Enter due date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vendor_name" className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-muted-foreground" />
              Vendor Name
            </Label>
            <Input
              id="vendor_name"
              value={editableData.vendor_name || ""}
              onChange={(e) => updateField("vendor_name", e.target.value)}
              placeholder="Enter vendor name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customer_name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Customer Name
            </Label>
            <Input
              id="customer_name"
              value={editableData.customer_name || ""}
              onChange={(e) => updateField("customer_name", e.target.value)}
              placeholder="Enter customer name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_type" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-green-600" />
              Payment Type
            </Label>
            <Input
              id="payment_type"
              value={editableData.payment_type || ""}
              onChange={(e) => updateField("payment_type", e.target.value)}
              placeholder="Enter payment type"
            />
          </div>
        </div>
      </Card>

      {/* Line Items Form */}
      {editableData.line_items && editableData.line_items.length > 0 && (
        <Card className="overflow-hidden">
          <div className="bg-muted/50 px-6 py-3 border-b border-border flex items-center justify-between">
            <h4 className="font-semibold text-foreground">Line Items</h4>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1">
                  <Plus className="w-4 h-4" />
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_category">Category Name</Label>
                    <Input
                      id="new_category"
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="Enter category name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddCategory();
                      }}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddCategory}>Add Category</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="p-6 space-y-4">
            {editableData.line_items.map((item, index) => (
              <Card key={index} className="p-4 bg-muted/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2 space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={item.description || ""}
                      onChange={(e) => updateLineItem(index, "description", e.target.value)}
                      placeholder="Item description"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Category
                    </Label>
                    <Select
                      value={item.category || ""}
                      onValueChange={(value) => updateLineItem(index, "category", value)}
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
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) => updateLineItem(index, "quantity", e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="Qty"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Amount ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formatCurrency(item.amount)}
                      onChange={(e) => updateLineItem(index, "amount", e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Totals Section */}
          <div className="border-t border-border bg-gradient-to-br from-muted/30 to-muted/10 p-6">
            <div className="max-w-md ml-auto space-y-3">
              <div className="flex justify-between items-center gap-4">
                <Label className="text-muted-foreground">Subtotal:</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formatCurrency(editableData.subtotal)}
                  onChange={(e) => updateField("subtotal", e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-32 text-right"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center gap-4">
                <Label className="text-accent">Discount:</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formatCurrency(editableData.discount)}
                  onChange={(e) => updateField("discount", e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-32 text-right"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center gap-4">
                <Label className="text-muted-foreground">Tax:</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formatCurrency(editableData.tax)}
                  onChange={(e) => updateField("tax", e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-32 text-right"
                  placeholder="0.00"
                />
              </div>
              <div className="flex justify-between items-center gap-4 border-t-2 border-primary/30 pt-3 mt-2">
                <Label className="text-xl font-bold text-foreground">Total:</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formatCurrency(editableData.total)}
                  onChange={(e) => updateField("total", e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="w-32 text-right text-lg font-bold text-primary"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Notes Section */}
      <Card className="overflow-hidden">
        <div className="bg-muted/50 px-6 py-3 border-b border-border">
          <h4 className="font-semibold text-foreground flex items-center gap-2">
            <StickyNote className="w-4 h-4 text-primary" />
            Notes & Observations
          </h4>
        </div>
        <div className="p-6">
          <Textarea
            value={editableData.notes || ""}
            onChange={(e) => updateField("notes", e.target.value)}
            placeholder="Add notes or observations..."
            className="min-h-[100px]"
          />
        </div>
      </Card>

      {/* Try Another Image Button */}
      {onReset && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={onReset}
            variant="outline"
            size="lg"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Try Another Image
          </Button>
        </div>
      )}
    </div>
  );
};
