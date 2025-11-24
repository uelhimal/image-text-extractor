import { LineItem } from "@/utils/invoiceParser";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "./ui/card";

interface LineItemsTableProps {
  items: LineItem[];
  subtotal?: string;
  discount?: string;
  tax?: string;
  total?: string;
}

export const LineItemsTable = ({
  items,
  subtotal,
  discount,
  tax,
  total,
}: LineItemsTableProps) => {
  if (items.length === 0) {
    return null;
  }

  const formatCurrency = (value?: string) => {
    if (!value) return '-';
    const num = parseFloat(value.replace(/,/g, ''));
    return isNaN(num) ? value : `$${num.toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-foreground">Line Items</h3>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="text-center font-semibold">Quantity</TableHead>
                <TableHead className="text-right font-semibold">Unit Price</TableHead>
                <TableHead className="text-right font-semibold">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium">{item.description}</TableCell>
                  <TableCell className="text-center">{item.quantity || '-'}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                  <TableCell className="text-right font-semibold">{formatCurrency(item.amount)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Totals Section */}
        <div className="border-t border-border bg-muted/20 p-4">
          <div className="max-w-md ml-auto space-y-2">
            {subtotal && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span className="font-medium">{formatCurrency(subtotal)}</span>
              </div>
            )}
            {discount && (
              <div className="flex justify-between text-sm text-accent">
                <span>Discount:</span>
                <span className="font-medium">-{formatCurrency(discount)}</span>
              </div>
            )}
            {tax && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span className="font-medium">{formatCurrency(tax)}</span>
              </div>
            )}
            {total && (
              <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2">
                <span className="text-foreground">Total:</span>
                <span className="text-primary">{formatCurrency(total)}</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
