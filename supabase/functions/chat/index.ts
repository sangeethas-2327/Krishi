import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, role } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompts: Record<string, string> = {
      farmer: `You are KrishiSetu AI, a smart farming advisor for Indian farmers. You provide advice on:
- Yield prediction and crop planning
- Pest and disease advisory with India-approved treatments
- Market sell/hold advice based on mandi prices
- Irrigation and fertilizer guidance
- Government scheme eligibility (PM-KISAN, PMFBY, PMKSY, KCC, etc.)
- KVK recommendations
Keep responses practical, localized to Indian agriculture, and actionable. Use ₹ for currency. Reference Indian seasons (Kharif/Rabi/Zaid).`,
      gardener: `You are KrishiSetu AI, a gardening assistant for Indian home gardeners. You help with:
- Terrace and balcony gardening advice
- Indoor plant care tips for Indian climate
- Seasonal planting guidance for Indian regions
- Organic pest control and composting
- Soil and nutrition management
Keep advice practical for urban Indian gardens.`,
      student: `You are KrishiSetu AI, an agricultural science tutor. You help students with:
- ICAR syllabus explanations (Plant Pathology, Soil Science, Crop Protection, etc.)
- Quiz preparation and concept clarification
- Research paper summaries in agricultural sciences
- Career guidance in agriculture
Explain concepts clearly with examples from Indian agriculture.`,
      expert: `You are KrishiSetu AI, a research assistant for agricultural experts. You help with:
- Model performance analysis and improvement suggestions
- Dataset quality assessment and augmentation strategies
- Latest research in plant disease detection using AI/ML
- Smart retraining recommendations
Provide technical, data-driven insights.`,
    };

    const systemPrompt = systemPrompts[role] || systemPrompts.farmer;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits in Settings." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
