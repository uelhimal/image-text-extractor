import { supabase } from "@/integrations/supabase/client";

export interface AILineItem {
  description: string;
  quantity?: number;
  unit_price?: number;
  amount: number;
}

export interface AIInvoiceData {
  invoice_number?: string;
  invoice_date?: string;
  due_date?: string;
  vendor_name?: string;
  customer_name?: string;
  line_items: AILineItem[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  total: number;
}

export const extractInvoiceWithAI = async (text: string): Promise<AIInvoiceData> => {
  const { data, error } = await supabase.functions.invoke('extract-invoice-data', {
    body: { text }
  });

  if (error) {
    console.error('Error extracting invoice data:', error);
    throw new Error(error.message || 'Failed to extract invoice data');
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data as AIInvoiceData;
};
