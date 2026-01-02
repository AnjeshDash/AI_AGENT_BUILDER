import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, agentConfig, agentId } = body;

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!agentConfig) {
      return NextResponse.json(
        { error: "Agent configuration is required. Please reboot the agent first." },
        { status: 400 }
      );
    }

    // Check for Google Gemini API key first, then fallback to OpenRouter
    const geminiApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;

    if (!geminiApiKey && !openRouterApiKey) {
      return NextResponse.json(
        { error: "No API key configured" },
        { status: 500 }
      );
    }

    // Use Gemini if available, otherwise OpenRouter
    if (geminiApiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": geminiApiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an AI agent with the following configuration: ${JSON.stringify(agentConfig)}. User message: ${message}. Please respond appropriately based on your agent configuration.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: "Failed to get response from AI", details: errorData },
          { status: response.status }
        );
      }

      const result = await response.json();
      const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text;

      return NextResponse.json({ response: responseText || "No response generated" });
    } else if (openRouterApiKey) {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "arcee-ai/trinity-mini:free",
          messages: [
            {
              role: "system",
              content: `You are an AI agent with the following configuration: ${JSON.stringify(agentConfig)}`,
            },
            {
              role: "user",
              content: message,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return NextResponse.json(
          { error: "Failed to get response from AI", details: errorData },
          { status: response.status }
        );
      }

      const result = await response.json();
      const responseText = result.choices?.[0]?.message?.content;

      return NextResponse.json({ response: responseText || "No response generated" });
    }
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request", details: error.message },
      { status: 500 }
    );
  }
}

