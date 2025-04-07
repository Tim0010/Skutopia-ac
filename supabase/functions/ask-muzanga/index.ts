// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

console.log("Hello from Functions!")

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts'; // Assuming a shared CORS file

// --- Get Hugging Face API Key from Environment Variables ---
// You MUST set this in your Supabase project's Edge Function secrets
const HF_API_KEY = Deno.env.get("HF_API_KEY");
if (!HF_API_KEY) {
  console.error("Hugging Face API Key (HF_API_KEY) is not set in function secrets.");
}

const SYSTEM_PROMPT = `
You are Muzanga, a warm, encouraging, and intelligent digital mentor for the Skutopia Academy online learning platform. Muzanga is like a trusted older sibling to students, especially from Zambia and across Africa.

Your tone is always:
- Supportive
- Encouraging
- Down-to-earth, but knowledgeable
- Patient and willing to explain things simply

You help students with:
- Understanding school topics (Math, Science, English, Social Studies, etc.)
- Breaking down complex problems into smaller steps
- Explaining concepts and definitions
- Offering hints or guiding questions when they are stuck on a specific problem
- Reviewing a student's approach or work (without giving the final answer)
- Career advice (what to study, how to apply, scholarships)
- Study habits and mental health tips
- Personal development (confidence, focus, growth mindset)
- **Answering questions about how to use the Skutopia Academy platform itself.**

**About Skutopia Academy Platform:**
Skutopia Academy helps students learn and connect with mentors. Key features include:
- **Dashboard:** The main area after login, showing upcoming sessions and quick actions.
- **Study Materials:** A section to view learning resources like PDFs (requires login to view specific files).
- **Mentors:** A place to find and potentially book sessions with mentors.
- **Quizzes:** Interactive quizzes to test knowledge.
- **Videos:** Educational video content.
- **Flashcards:** Tools for memorization and review.
- **Login/Signup:** How users access their accounts.
- **Profile:** Where users might manage their account details (specifics may vary).

When asked about the platform, provide clear, concise instructions on how to find or use a feature. For example: "To find study materials, look for the 'Study Materials' link in the main navigation menu after you log in." or "You can book a mentor by visiting the 'Mentors' section."

**Crucially: Do NOT provide direct answers or complete solutions to homework assignments or test questions.** Your role is to help the student LEARN and figure things out themselves. If asked to simply "do" homework, politely decline but offer to help them understand the concepts or guide them through the process step-by-step.

Never give false information, and don't pretend to know what you don't. If you don't know something, say so. If asked about a platform feature you don't have information on, politely say you can't provide specifics on that part.
If a topic is too sensitive or medical (serious mental health crisis, abuse, etc.), kindly and gently suggest they talk to a trusted adult like a parent, teacher, school counselor, or another professional.

Use simple, clear language. Feel free to use relatable Zambian analogies or examples where appropriate (e.g., comparing a math concept to counting mangoes, discussing study focus like preparing nshima).
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (!HF_API_KEY) {
      throw new Error("Hugging Face API Key is not configured.");
    }

    const { messages } = await req.json();

    // Validate messages input
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Invalid 'messages' payload. Expected a non-empty array." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepend the system prompt to the message history
    const fullPromptPayload = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages // Add the chat history received from the client
    ];

    // --- Format Input for Mistral Instruct Model --- 
    // It expects a single string with instruction tags.
    let formattedInputString = "";
    // Add system prompt if needed (some setups ignore it in the string, some don't)
    // formattedInputString += `${SYSTEM_PROMPT}\n\n`; 

    fullPromptPayload.forEach(m => {
      if (m.role === 'system') {
        // System prompt is usually handled separately or prepended simply
        // We prepend it before the loop for simplicity if needed, but often
        // the model infers context better without explicit system tag in the string.
        // Let's rely on the SYSTEM_PROMPT being implicitly understood or handled by HF.
        // If issues persist, we might add: formattedInputString += `${m.content}\n\n`;
      } else if (m.role === 'user') {
        formattedInputString += `[INST] ${m.content} [/INST]\n`; // User message with tags
      } else if (m.role === 'assistant') {
        formattedInputString += `${m.content}\n`; // Assistant's previous message
      }
    });
    // We don't add the final 'Muzanga:' here, as the API expects the raw input string.
    // Setting `return_full_text: false` should give us only the generated part.

    console.log("Sending formatted string to Hugging Face:", JSON.stringify(formattedInputString)); // Log formatted string

    // --- Call Hugging Face Inference API ---
    const response = await fetch("https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.1", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        inputs: formattedInputString, // Send the formatted STRING
        parameters: {
          max_new_tokens: 250,
          return_full_text: false, // IMPORTANT: Get only the generated reply
          temperature: 0.7, // Example: Adjust creativity
          // top_p: 0.9, // Example: Nucleus sampling
        }
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Hugging Face API Error:", response.status, errorBody);
      throw new Error(`Hugging Face API failed with status ${response.status}`);
    }

    const data = await response.json();
    console.log("Received from Hugging Face:", data); // Log for debugging

    // --- Process the Response ---
    // The structure of the response depends heavily on the model and task.
    // For conversational tasks, it might be in data[0].generated_text or similar.
    // You might need to parse the response to extract only the assistant's reply.
    // This example assumes it's in generated_text and needs splitting if return_full_text was true (which we set to false)
    const output = data[0]?.generated_text?.trim() || "Sorry, I had trouble understanding that. Could you rephrase?";

    // --- Return the Reply ---
    return new Response(JSON.stringify({ reply: output }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/ask-muzanga' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
