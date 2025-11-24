export interface InvoiceData {
  [key: string]: string;
}

export const parseInvoiceText = (text: string): InvoiceData => {
  const lines = text.split('\n').filter(line => line.trim());
  const invoiceData: InvoiceData = {};
  
  // Common invoice field patterns
  const patterns = [
    { key: 'Invoice Number', regex: /invoice\s*(?:#|number|no\.?)?:?\s*([A-Z0-9-]+)/i },
    { key: 'Invoice Date', regex: /(?:invoice\s*)?date:?\s*([0-9\/\-\.]+)/i },
    { key: 'Due Date', regex: /due\s*date:?\s*([0-9\/\-\.]+)/i },
    { key: 'Total Amount', regex: /(?:total|amount|grand\s*total):?\s*\$?\s*([0-9,]+\.?\d*)/i },
    { key: 'Subtotal', regex: /(?:sub\s*total|subtotal):?\s*\$?\s*([0-9,]+\.?\d*)/i },
    { key: 'Tax', regex: /(?:tax|vat|gst):?\s*\$?\s*([0-9,]+\.?\d*)/i },
    { key: 'Customer Name', regex: /(?:bill\s*to|customer|client):?\s*([A-Za-z\s]+)/i },
    { key: 'Company Name', regex: /(?:company|vendor|supplier):?\s*([A-Za-z\s&.]+)/i },
    { key: 'Email', regex: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i },
    { key: 'Phone', regex: /(?:phone|tel|mobile):?\s*([+\d\s\(\)-]+)/i },
    { key: 'Address', regex: /(?:address|location):?\s*([A-Za-z0-9\s,.-]+)/i },
    { key: 'PO Number', regex: /(?:po|purchase\s*order)\s*(?:#|number|no\.?)?:?\s*([A-Z0-9-]+)/i },
  ];

  // Try to match each pattern
  patterns.forEach(({ key, regex }) => {
    const match = text.match(regex);
    if (match && match[1]) {
      invoiceData[key] = match[1].trim();
    }
  });

  // Try to extract key:value pairs from lines
  lines.forEach(line => {
    const colonMatch = line.match(/^([^:]+):\s*(.+)$/);
    if (colonMatch && colonMatch[1] && colonMatch[2]) {
      const key = colonMatch[1].trim();
      const value = colonMatch[2].trim();
      
      // Only add if key doesn't already exist and isn't too long
      if (!invoiceData[key] && key.length < 30 && value.length < 100) {
        invoiceData[key] = value;
      }
    }
  });

  return invoiceData;
};
