import { Copy, Check, FileText, Calendar, Building2, User, CreditCard, RotateCcw, Plus, Send, DollarSign, Briefcase, Lock, Globe } from "lucide-react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const CURRENCY_OPTIONS = ["USD", "EUR", "GBP", "CAD", "AUD", "INR", "JPY"];

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

export const AIInvoiceDisplay = ({ data, onReset }: AIInvoiceDisplayProps) => {
  const [copied, setCopied] = useState(false);
  const [editableData, setEditableData] = useState<ExtendedFormData>(() => {
    // Merge notes into the first line item's description if notes exist
    const baseData: ExtendedFormData = {
      ...data,
      vendor: data.vendor_name || "",
      client: data.customer_name || "",
      project: "",
      category: DEFAULT_CATEGORIES[0],
      assigned_user: "",
      currency: "USD",
      private_notes: "",
      public_notes: "",
      description_comments: data.notes || "",
    };
    
    // Set default category for line items
    if (data.line_items && data.line_items.length > 0) {
      baseData.line_items = data.line_items.map((item) => ({
        ...item,
        category: item.category || DEFAULT_CATEGORIES[0],
      }));
    }
    
    return baseData;
  });
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [newCategory, setNewCategory] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

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
      line_items: editableData.line_items,
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
              <DollarSign className="w-4 h-4 text-primary" />
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
              rows={2}
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
              rows={2}
            />
          </div>
        </div>
      </Card>

      {/* Line Items Table */}
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
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="font-semibold min-w-[250px]">Item Name</TableHead>
                  <TableHead className="font-semibold min-w-[180px]">Category</TableHead>
                  <TableHead className="text-center font-semibold w-[100px]">Quantity</TableHead>
                  <TableHead className="text-right font-semibold w-[120px]">Amount ($)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editableData.line_items.map((item, index) => (
                  <TableRow key={index} className="hover:bg-muted/20 transition-colors">
                    <TableCell>
                      <Input
                        value={item.description || ""}
                        onChange={(e) => updateLineItem(index, "description", e.target.value)}
                        placeholder="Item name"
                        className="border-0 bg-transparent focus-visible:ring-1"
                      />
                    </TableCell>
                    <TableCell>
                      <Select
                        value={item.category || DEFAULT_CATEGORIES[0]}
                        onValueChange={(value) => updateLineItem(index, "category", value)}
                      >
                        <SelectTrigger className="border-0 bg-transparent focus:ring-1">
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
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.quantity || ""}
                        onChange={(e) => updateLineItem(index, "quantity", e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="Qty"
                        className="border-0 bg-transparent text-center focus-visible:ring-1"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        step="0.01"
                        value={formatCurrency(item.amount)}
                        onChange={(e) => updateLineItem(index, "amount", e.target.value ? parseFloat(e.target.value) : undefined)}
                        placeholder="0.00"
                        className="border-0 bg-transparent text-right focus-visible:ring-1"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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