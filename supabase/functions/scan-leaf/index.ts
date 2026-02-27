import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageBase64, scanType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = scanType === "classification"
      ? `You are an expert botanist specializing in Indian agriculture. Analyze the leaf image and return a JSON object with:
{
  "localName": "Plant name with Hindi name in parentheses",
  "scientificName": "Latin binomial",
  "category": "Cereal/Pulse/Vegetable/Fruit/Medicinal/Ornamental",
  "soilSuitability": ["Array of suitable soil types: Black/Red/Alluvial/Laterite/Clay/Loamy"],
  "waterReq": "Water requirement description",
  "sunlightReq": "Sunlight requirement",
  "growthDuration": "Duration in days",
  "yieldPotential": "Yield in tonnes/hectare",
  "marketDemand": "Market demand in India",
  "suitableStates": ["Array of suitable Indian states"]
}
Return ONLY valid JSON, no markdown.`
      : `You are an expert plant pathologist specializing in Indian crop diseases. Analyze the leaf image and return a JSON object with:
{
  "plantName": "Plant name with Hindi name in parentheses",
  "scientificName": "Latin binomial of the plant",
  "disease": "Disease name in English",
  "diseaseName": "Disease name in Hindi",
  "severity": "Low/Medium/High",
  "confidence": 85,
  "cause": "Brief cause description",
  "symptoms": "Visible symptoms",
  "organicTreatment": "India-approved organic treatments",
  "chemicalTreatment": "India-approved chemical treatments with dosage",
  "prevention": "Prevention tips",
  "climateAdvisory": "Climate-based advisory for Indian conditions"
}
If the leaf appears healthy, set disease to "Healthy" and severity to "None".
Return ONLY valid JSON, no markdown.`;

    const messages = [
      { role: "system", content: systemPrompt },
      {
        role: "user",
        content: [
          { type: "text", text: scanType === "classification" ? "Identify this plant from the leaf image." : "Analyze this leaf for diseases." },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${imageBase64}` } },
        ],
      },
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("Scan AI error:", response.status, t);
      throw new Error("AI analysis failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";
    
    // Parse the JSON from the AI response
    let result;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      result = { error: "Failed to parse AI response", raw: content };
    }

    return new Response(JSON.stringify({ result, scanType }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("scan error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
