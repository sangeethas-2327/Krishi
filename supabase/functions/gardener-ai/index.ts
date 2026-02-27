import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, plants, soilData, plantName, note, healthStatus } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "generate_care_schedule":
        systemPrompt = `You are an expert Indian home gardening coach. Generate practical daily care schedules for Indian home garden plants. Return ONLY valid JSON array.`;
        userPrompt = `Generate a 7-day care schedule for these plants: ${JSON.stringify(plants || ["Tulsi", "Tomato", "Rose", "Curry Leaf"])}.
Return JSON array of tasks for today and tomorrow: [{"plant_name":"Tulsi","task_type":"Water","scheduled_time":"7:00 AM","scheduled_date":"today","frequency":"daily","notes":"Water at base, avoid leaves"}].
Mix watering, fertilizing, pruning, neem oil sprays, and other care tasks. Use realistic Indian gardening knowledge.`;
        break;

      case "soil_advice":
        systemPrompt = `You are an Indian soil scientist for home gardeners. Provide practical organic remedies. Return ONLY valid JSON.`;
        userPrompt = `Analyze this soil reading for an Indian home garden:
Nitrogen: ${soilData?.nitrogen_ppm || 65} ppm
Phosphorus: ${soilData?.phosphorus_ppm || 42} ppm
Potassium: ${soilData?.potassium_ppm || 35} ppm
pH: ${soilData?.ph || 6.3}
Moisture: ${soilData?.moisture_pct || 55}%

Return JSON: {
  "overall_status": "Good|Fair|Poor",
  "recommendation": "2-3 sentence organic remedy advice using Indian household items",
  "alerts": [{"nutrient":"N/P/K/pH","status":"Low|High|Optimal","fix":"how to fix organically"}],
  "best_plants": ["plant1","plant2","plant3"]
}`;
        break;

      case "plant_health_tip":
        systemPrompt = `You are an Indian home gardening expert. Provide a specific, actionable tip for plant care based on the diary entry. Return ONLY valid JSON.`;
        userPrompt = `A gardener wrote this diary note for their ${plantName || "plant"}:
"${note || "Plant is growing well."}"
Health status: ${healthStatus || "Healthy"}

Return JSON: {"tip": "one specific actionable tip (1-2 sentences)", "urgency": "low|medium|high", "next_action": "what to do next"}`;
        break;

      default:
        throw new Error("Unknown action: " + action);
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
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI request failed");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let result;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      result = JSON.parse(cleaned);
    } catch {
      result = { error: "Failed to parse AI response", raw: content };
    }

    return new Response(JSON.stringify({ result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("gardener-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
