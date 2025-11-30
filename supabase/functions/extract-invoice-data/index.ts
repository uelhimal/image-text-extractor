import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LineItem {
  description: string;
  quantity?: number;
  unit_price?: number;
  amount: number;
  category?: string;
}

interface InvoiceData {
  invoice_number?: string;
  invoice_date?: string;
  invoice_time?: string;
  due_date?: string;
  vendor_name?: string;
  customer_name?: string;
  payment_type?: string;
  line_items: LineItem[];
  subtotal?: number;
  discount?: number;
  tax?: number;
  total: number;
  notes?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();
    console.log("Extracting invoice data from text:", text.substring(0, 200));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: `You are an expert invoice data extraction system. Extract structured information from invoice text with high accuracy. Always return amounts as numbers without currency symbols.`,
          },
          {
            role: "user",
            content: `Extract all invoice information from this text:\n\n${text}`,
          },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "extract_invoice_data",
              description: "Extract structured invoice data including line items and totals",
              parameters: {
                type: "object",
                properties: {
                  invoice_number: {
                    type: "string",
                    description: "The invoice number or ID",
                  },
                  invoice_date: {
                    type: "string",
                    description: "The invoice date in YYYY-MM-DD format",
                  },
                  invoice_time: {
                    type: "string",
                    description: "The invoice time in HH:MM format if available",
                  },
                  due_date: {
                    type: "string",
                    description: "The payment due date in YYYY-MM-DD format",
                  },
                  payment_type: {
                    type: "string",
                    description: "Payment method used (e.g., Cash, Card, Credit, Bank Transfer, Check)",
                  },
                  vendor_name: {
                    type: "string",
                    description: "The vendor or supplier company name",
                  },
                  customer_name: {
                    type: "string",
                    description: "The customer or bill-to name",
                  },
                  line_items: {
                    type: "array",
                    description: "Array of individual items on the invoice",
                    items: {
                      type: "object",
                      properties: {
                        description: {
                          type: "string",
                          description: "Item or service description",
                        },
                        quantity: {
                          type: "number",
                          description: "Quantity of items",
                        },
                        unit_price: {
                          type: "number",
                          description: "Price per unit",
                        },
                        amount: {
                          type: "number",
                          description: "Total amount for this line item",
                        },
                        category: {
                          type: "string",
                          description: "Item category (e.g., Food & Beverages, Office Supplies, Services, Hardware, Software, Travel, Utilities)",
                        },
                      },
                      required: ["description", "amount"],
                    },
                  },
                  subtotal: {
                    type: "number",
                    description: "Subtotal before tax and discounts",
                  },
                  discount: {
                    type: "number",
                    description: "Discount amount applied",
                  },
                  tax: {
                    type: "number",
                    description: "Tax amount",
                  },
                  total: {
                    type: "number",
                    description: "Final total amount",
                  },
                  notes: {
                    type: "string",
                    description: "Additional notes or observations about the invoice (e.g., payment terms, special instructions, irregularities)",
                  },
                },
                required: ["line_items", "total"],
              },
            },
          },
        ],
        tool_choice: {
          type: "function",
          function: { name: "extract_invoice_data" },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: "Rate limit exceeded. Please try again in a moment.",
            code: "RATE_LIMIT"
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: "AI credits exhausted. Please add credits to continue.",
            code: "PAYMENT_REQUIRED"
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const invoiceData: InvoiceData = JSON.parse(toolCall.function.arguments);
    console.log("Extracted invoice data:", invoiceData);

    return new Response(JSON.stringify(invoiceData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in extract-invoice-data function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        code: "EXTRACTION_ERROR"
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
