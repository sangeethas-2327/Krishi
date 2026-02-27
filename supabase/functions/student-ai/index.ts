import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, topic, count, submission, assignmentTitle } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (action) {
      case "generate_quiz":
        systemPrompt = `You are an ICAR-aligned agricultural science quiz master for Indian students. Generate quiz questions with 4 options each. Return ONLY valid JSON array.`;
        userPrompt = `Generate ${count || 5} multiple choice questions on "${topic || "General Agriculture"}". Return JSON array: [{"q":"question","options":["a","b","c","d"],"answer":0,"explanation":"why"}]. answer is the 0-based index of correct option.`;
        break;

      case "generate_research":
        systemPrompt = `You are an Indian agricultural research summarizer. Summarize recent research relevant to Indian agriculture. Return ONLY valid JSON array.`;
        userPrompt = `Generate ${count || 5} research paper summaries on Indian agriculture topics. Return JSON array: [{"title":"paper title","source":"journal name","date":"month year","summary":"2-3 sentence AI summary","tags":["tag1","tag2"]}].`;
        break;

      case "generate_lab":
        systemPrompt = `You are an agricultural science virtual lab instructor for Indian students. Create interactive lab exercises. Return ONLY valid JSON array.`;
        userPrompt = `Generate ${count || 4} virtual lab exercises on "${topic || "Plant Science"}". Return JSON array: [{"title":"exercise title","type":"Microscopy|Disease ID|Lab Exercise|Field Study","xp":50,"difficulty":"Easy|Medium|Hard","description":"what student will do","steps":["step1","step2","step3"]}].`;
        break;

      case "grade_assignment":
        systemPrompt = `You are an ICAR agricultural science professor. Grade student submissions fairly and provide constructive feedback. Return ONLY valid JSON.`;
        userPrompt = `Grade this student submission for the assignment "${assignmentTitle}":
"${submission}"
Return JSON: {"score": 0-100, "feedback": "detailed constructive feedback", "strengths": ["strength1"], "improvements": ["improvement1"]}`;
        break;

      case "generate_assignments":
        systemPrompt = `You are an ICAR-aligned agricultural science professor. Create practical assignments for Indian agricultural students. Return ONLY valid JSON array.`;
        userPrompt = `Generate ${count || 4} assignments for agricultural science students. Return JSON array: [{"title":"assignment title","description":"detailed description","points":100,"due_days":7}]. due_days is days from now.`;
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
    console.error("student-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
