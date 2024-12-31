import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, content, meetingId } = await req.json();
    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'processCommand':
        systemPrompt = 'You are an AI assistant processing voice commands. Extract the intent and relevant details.';
        userPrompt = content;
        break;
      case 'analyzeTranscript':
        systemPrompt = 'You are an AI assistant analyzing meeting transcripts. Identify action items, deadlines, and key points.';
        userPrompt = content;
        break;
      case 'generateSummary':
        systemPrompt = 'You are an AI assistant generating meeting summaries. Create a concise summary with key points and action items.';
        userPrompt = content;
        break;
      default:
        throw new Error('Invalid request type');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    return new Response(JSON.stringify({ result: data.choices[0].message.content }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in AI assistant function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});