import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, reviewItem, metricsData, datasetStats, categoryName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "review_assist":
        systemPrompt = `You are an Indian plant pathology expert and AI model reviewer. Analyze crop disease predictions and provide expert-level second opinions. Return ONLY valid JSON.`;
        userPrompt = `Review this AI disease prediction:
Crop: ${reviewItem?.crop}
AI Predicted Disease: ${reviewItem?.disease_predicted}
Confidence: ${reviewItem?.confidence_pct}%
Severity: ${reviewItem?.severity}
Farmer Location: ${reviewItem?.district}

Return JSON: {
  "suggested_diagnosis": "confirmed or corrected disease name",
  "confidence_agreement": "agree|disagree|uncertain",
  "reasoning": "2-3 sentences of expert reasoning",
  "treatment_urgency": "immediate|within_week|monitor",
  "recommended_treatment": "specific treatment protocol",
  "additional_tests": ["test1"] or []
}`;
        break;

      case "training_recommendations":
        systemPrompt = `You are an Indian agricultural AI/ML model training expert. Provide practical recommendations for retraining crop disease detection models. Return ONLY valid JSON array.`;
        userPrompt = `Analyze these model metrics and provide retraining recommendations:
${JSON.stringify(metricsData || {})}
Dataset stats: ${JSON.stringify(datasetStats || {})}

Return JSON array of recommendations: [{"title":"recommendation title","detail":"specific actionable detail","priority":"high|medium|low","type":"data|hyperparameter|architecture|augmentation"}]
Focus on Indian crop diseases. Give 4-5 concrete recommendations.`;
        break;

      case "analytics_insights":
        systemPrompt = `You are an agricultural platform analytics expert. Analyze usage data and provide insights about Indian farmers' and gardeners' app usage patterns. Return ONLY valid JSON.`;
        userPrompt = `Analyze this platform data and provide insights:
Total scans from scan_history, profiles breakdown by role.
Generate realistic insights for an Indian agri-tech platform.

Return JSON: {
  "key_insights": ["insight1","insight2","insight3"],
  "growth_trend": "positive|neutral|negative",
  "top_disease_season": "current season disease to watch",
  "recommendations": ["platform improvement recommendation 1","recommendation 2"]
}`;
        break;

      case "generate_kb_entries":
        systemPrompt = `You are an Indian plant pathologist. Generate accurate knowledge base entries for Indian agricultural diseases. Return ONLY valid JSON array.`;
        userPrompt = `Generate 3 knowledge base entries for the category: "${categoryName || "Fungal Diseases"}".
Return JSON array: [{"disease_name":"disease","crops_affected":["crop1","crop2"],"symptoms":"detailed symptoms description","treatment":"specific treatment with product names","prevention":"prevention measures","severity_level":"High|Medium|Low"}]
Focus on Indian subcontinent context with locally available treatments.`;
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
    console.error("expert-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
