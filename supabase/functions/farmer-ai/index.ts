import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, sensorData, district, state, crops, farmProfile } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "iot_alert":
        systemPrompt = `You are an Indian precision agriculture IoT specialist. Analyze sensor readings and provide concise alerts and recommendations for Indian crops. Return ONLY valid JSON.`;
        userPrompt = `Analyze these sensor readings for an Indian farm:
Temperature: ${sensorData?.temperature}°C
Soil Moisture: ${sensorData?.soil_moisture}%
Humidity: ${sensorData?.humidity}%
Soil pH: ${sensorData?.soil_ph}

Return JSON: {"alerts": [{"type":"warning|danger|info","message":"short alert"}], "recommendations": ["rec1","rec2"], "overall_status": "Optimal|Monitor|Action Required"}`;
        break;

      case "market_advice":
        systemPrompt = `You are an Indian agricultural market analyst. Provide practical sell/hold/buy recommendations for Indian mandi prices. Return ONLY valid JSON array.`;
        userPrompt = `Generate current market prices and AI advice for these Indian crops: Wheat, Rice (Basmati), Tomato, Onion, Sugarcane, Potato, Maize, Soybean.
Return JSON array: [{"name":"crop","price":2450,"change":50,"trend":"up|down|stable","unit":"quintal","mandi":"city (state)","aiAdvice":"sell/hold/store recommendation with reason","confidence":85}]
Use realistic current Indian mandi prices in INR.`;
        break;

      case "weather_advice":
        systemPrompt = `You are an Indian agricultural meteorology expert. Provide farming-specific weather advice. Return ONLY valid JSON.`;
        userPrompt = `Provide weather forecast and farming advice for ${district || "Lucknow"}, ${state || "Uttar Pradesh"}, India.
Return JSON: {
  "current": {"temp":34,"feels_like":37,"condition":"Partly Cloudy","humidity":65,"wind_kmh":12},
  "forecast": [{"day":"Today","high":34,"low":22,"rain_pct":10,"condition":"Sunny"},{"day":"Tomorrow","high":30,"low":20,"rain_pct":60,"condition":"Rainy"},{"day":"Day 3","high":28,"low":19,"rain_pct":80,"condition":"Heavy Rain"},{"day":"Day 4","high":32,"low":21,"rain_pct":15,"condition":"Partly Cloudy"},{"day":"Day 5","high":35,"low":23,"rain_pct":5,"condition":"Sunny"}],
  "alert": {"title":"","message":""},
  "irrigation_advice": "detailed irrigation recommendation based on weather",
  "farm_tips": ["tip1","tip2","tip3"]
}`;
        break;

      case "scheme_eligibility":
        systemPrompt = `You are an Indian government agricultural schemes expert. Assess eligibility for Indian farmer schemes. Return ONLY valid JSON array.`;
        userPrompt = `Assess eligibility for government schemes for a farmer with profile: ${JSON.stringify(farmProfile || { state: "Uttar Pradesh", crops: ["Wheat", "Rice"] })}
Return JSON array for these schemes: PM-KISAN, PMFBY, PMKSY, Soil Health Card, KCC, eNAM, PKVY, Pradhan Mantri Fasal Bima Yojana:
[{"name":"scheme_name","desc":"short description","eligibility_score":85,"amount":"₹X,XXX/year","deadline":"date or Open","docs":["doc1","doc2"],"apply_url":"https://gov.in/scheme","tips":"how to maximize benefit"}]`;
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
    console.error("farmer-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
