import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { GoogleGenAI } from "npm:@google/genai";

const TAVILY_API_KEY = Deno.env.get("TAVILY_API_KEY");
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { partNumber, description, market, referenceLink } = await req.json();

    if (!partNumber || !description) {
      throw new Error("partNumber and description are required");
    }

    const marketKeyword = market === "Germany" ? "Germany Deutschland" : "Europe EU";
    const refHint = referenceLink ? ` product website:${referenceLink}` : "";
    const searchQuery = `"${partNumber}" ${description} supplier distributor ${marketKeyword}${refHint}`.trim();

    console.log("Tavily search query:", searchQuery);

    const tavilyRes = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY_API_KEY,
        query: searchQuery,
        search_depth: "advanced",
        include_raw_content: false,
        max_results: 7,
      }),
    });

    if (!tavilyRes.ok) {
      const errorText = await tavilyRes.text();
      console.error("Tavily Error:", errorText);
      throw new Error(`Tavily API error: ${tavilyRes.statusText} - ${errorText}`);
    }

    const searchData = await tavilyRes.json();

    console.log("Tavily results URLs:", searchData.results?.map((r: any) => r.url));

    const context = searchData.results
      .map(result => {
        const snippet = result.content.slice(0, 5000);
        return `SOURCE URL: ${result.url}\nSNIPPET: ${snippet}`;
      })
      .join("\n\n");

    if (!context) {
      throw new Error("No search results returned from Tavily. Try a different part number or description.");
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    const systemPrompt = `You are an expert purchasing assistant AI specializing in industrial and electronic parts sourcing.

TASK: Analyze the web search snippets below and extract ONLY suppliers that are based in or ship to ${market}.

STRICT RULES:
1. DO NOT hallucinate. Only use data that is explicitly present in the search snippets.
2. GEOGRAPHIC FILTER: Only include suppliers whose website, address, or shipping info clearly indicates they operate in ${market}. Discard any supplier that appears to be based outside ${market} (e.g., US, UK, Asia) unless they explicitly serve ${market}.
3. "website": Use the EXACT SOURCE URL provided with each snippet — the direct product or category page, never a homepage.
4. "contact_email": Look carefully for any email addresses (sales@..., info@..., etc.) in the snippet text.
5. "price": Extract the numeric price only (no currency symbols). Use null if not found.
6. "availability_status": Determine from stock/availability language in the snippets. Use "Unknown" if unclear.
7. If NO valid ${market} suppliers are found in the data, return an empty "suppliers" array — do NOT invent suppliers.

Return ONLY a valid JSON object matching this exact schema. No markdown, no explanation:
{
  "report_id": "uuid (generate a random uuid v4)",
  "user_id": "00000000-0000-0000-0000-000000000000",
  "part_number": "${partNumber}",
  "description": "${description}",
  "market": "${market}",
  "availability_status": "In Stock" | "Limited" | "Out of Stock" | "Unknown",
  "suppliers": [
    {
      "name": "string",
      "website": "string (exact source URL from snippet)",
      "contact_email": "string | null",
      "price": "number | null",
      "currency": "EUR",
      "country_of_origin": "string"
    }
  ],
  "created_at": "string (current ISO 8601 timestamp)"
}`;

    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: systemPrompt },
            { text: `Here are the search result snippets to analyze:\n\n${context}` },
          ],
        },
      ],
    });

    let resultText = result.text;

    resultText = resultText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    console.log("Raw Gemini Output:", resultText);

    const finalReport = JSON.parse(resultText);

    return new Response(JSON.stringify(finalReport), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Function Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  }
});