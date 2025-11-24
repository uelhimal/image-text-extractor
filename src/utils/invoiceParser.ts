export interface LineItem {
  description: string;
  quantity?: string;
  unitPrice?: string;
  amount: string;
}

export interface InvoiceData {
  [key: string]: string;
}

export interface ParsedInvoice {
  metadata: InvoiceData;
  lineItems: LineItem[];
  subtotal?: string;
  discount?: string;
  tax?: string;
  total?: string;
}

export const parseInvoiceText = (text: string): ParsedInvoice => {
  const lines = text.split('\n').filter(line => line.trim());
  const invoiceData: InvoiceData = {};
  const lineItems: LineItem[] = [];
  let subtotal = '';
  let discount = '';
  let tax = '';
  let total = '';
  
  // Common invoice field patterns
  const patterns = [
    { key: 'Invoice Number', regex: /invoice\s*(?:#|number|no\.?)?:?\s*([A-Z0-9-]+)/i },
    { key: 'Invoice Date', regex: /(?:invoice\s*)?date:?\s*([0-9\/\-\.]+)/i },
    { key: 'Due Date', regex: /due\s*date:?\s*([0-9\/\-\.]+)/i },
    { key: 'Customer Name', regex: /(?:bill\s*to|customer|client):?\s*([A-Za-z\s]+)/i },
    { key: 'Company Name', regex: /(?:company|vendor|supplier):?\s*([A-Za-z\s&.]+)/i },
    { key: 'Email', regex: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i },
    { key: 'Phone', regex: /(?:phone|tel|mobile):?\s*([+\d\s\(\)-]+)/i },
    { key: 'PO Number', regex: /(?:po|purchase\s*order)\s*(?:#|number|no\.?)?:?\s*([A-Z0-9-]+)/i },
  ];

  // Try to match each pattern
  patterns.forEach(({ key, regex }) => {
    const match = text.match(regex);
    if (match && match[1]) {
      invoiceData[key] = match[1].trim();
    }
  });

  // Extract financial summary
  const subtotalMatch = text.match(/(?:sub\s*total|subtotal):?\s*\$?\s*([0-9,]+\.?\d*)/i);
  if (subtotalMatch) subtotal = subtotalMatch[1];

  const discountMatch = text.match(/discount:?\s*\$?\s*([0-9,]+\.?\d*)/i);
  if (discountMatch) discount = discountMatch[1];

  const taxMatch = text.match(/(?:tax|vat|gst):?\s*\$?\s*([0-9,]+\.?\d*)/i);
  if (taxMatch) tax = taxMatch[1];

  const totalMatch = text.match(/(?:total|grand\s*total|amount\s*due):?\s*\$?\s*([0-9,]+\.?\d*)/i);
  if (totalMatch) total = totalMatch[1];

  // Parse line items - look for lines with price patterns
  const pricePattern = /\$?\s*([0-9,]+\.?\d{2})/g;
  
  lines.forEach((line, index) => {
    // Skip header rows and total rows
    const lowerLine = line.toLowerCase();
    if (
      lowerLine.includes('description') ||
      lowerLine.includes('item') ||
      lowerLine.includes('product') ||
      lowerLine.includes('subtotal') ||
      lowerLine.includes('total') ||
      lowerLine.includes('discount') ||
      lowerLine.includes('tax')
    ) {
      return;
    }

    // Look for lines that contain prices (numbers with 2 decimal places)
    const prices = Array.from(line.matchAll(pricePattern)).map(m => m[1]);
    
    if (prices.length > 0) {
      // Try to extract item description (usually at the beginning)
      const descMatch = line.match(/^([A-Za-z0-9\s\-,.'()]+?)(?:\s+\d+|\s+\$)/);
      const description = descMatch ? descMatch[1].trim() : line.split(/\s+\d/)[0].trim();

      // Try to extract quantity (usually a standalone number before prices)
      const qtyMatch = line.match(/\s(\d+)\s/);
      const quantity = qtyMatch ? qtyMatch[1] : undefined;

      // Determine unit price and amount
      let unitPrice: string | undefined;
      let amount: string;

      if (prices.length >= 2) {
        // If we have 2+ prices, assume: last one is amount, second-to-last is unit price
        amount = prices[prices.length - 1];
        unitPrice = prices[prices.length - 2];
      } else {
        // Only one price - treat as amount
        amount = prices[0];
      }

      if (description && amount && description.length > 2) {
        lineItems.push({
          description,
          quantity,
          unitPrice,
          amount,
        });
      }
    }
  });

  return {
    metadata: invoiceData,
    lineItems,
    subtotal,
    discount,
    tax,
    total,
  };
};
