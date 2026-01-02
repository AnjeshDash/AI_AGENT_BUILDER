import { NextRequest, NextResponse } from "next/server";

const PROMPT = 'from this flow, Generate a agent instruction prompt with all details along with tools with all setting info in JSON format. Do not add any extra text just written JSON data. make sure to mentioned paramaters depends only:{ systemPrompt:"", primaryAgentName:"", "agents": [ { "id": "agent-id", "name": "", "model": "", "includeHistory": true|false, "output": "", "tools": ["tool-id"], "instruction": "" } ], "tools": [ { "id": "id", "name": "", "description": "", "method": "GET"|"POST", "url": "", "includeApikey": true, "apiKey": "", "parameters": { "key": "dataType" }, "usage": [ ], "assignedAgent": "" } ] }';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jsonConfig, model } = body; // Allow model selection from request

    if (!jsonConfig) {
      return NextResponse.json(
        { error: 'jsonConfig is required in request body' },
        { status: 400 }
      );
    }

    // Check for Google Gemini API key first, then fallback to OpenRouter
    const geminiApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    // Determine which API to use based on available keys and model preference
    const useGemini = geminiApiKey && (!model || model.includes('gemini'));
    
    let outputText: string;
    
    if (useGemini) {
      // Use Google Gemini API
      console.log('Using Google Gemini API, key length:', geminiApiKey.length);
      
      // Map model names to Gemini model IDs (using currently available models)
      const geminiModelMap: Record<string, string> = {
        'gemini-flash-1.5': 'gemini-2.0-flash',
        'gemini-pro-1.5': 'gemini-2.0-flash',
        'gemini-pro-2.0': 'gemini-2.0-flash',
      };
      
      // Default to Gemini 2.0 Flash
      const selectedModel = model && geminiModelMap[model] 
        ? geminiModelMap[model] 
        : 'gemini-2.0-flash';
      
      const prompt = JSON.stringify(jsonConfig) + PROMPT;
      
      // Use v1beta API with API key in header (X-goog-api-key) instead of query parameter
      let apiVersion = 'v1beta';
      let response = await fetch(
        `https://generativelanguage.googleapis.com/${apiVersion}/models/${selectedModel}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-goog-api-key": geminiApiKey  // Use header instead of query parameter
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: prompt
              }]
            }]
          })
        }
      );

      // If model not found, try alternative model names
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const initialErrorMessage = errorData.error?.message || '';
        
        // Try alternative models if the selected one doesn't work
        // Start with simpler, more widely available models
        const alternativeModels = [
          'gemini-2.0-flash',    // Standard 2.0 flash (most likely to work)
          'gemini-pro',           // Basic model, widely available
          'gemini-1.5-pro',       // Try 1.5 pro
          'gemini-2.5-flash'      // Latest 2.5 series
        ];
        
        if (initialErrorMessage.includes('not found') || initialErrorMessage.includes('not supported')) {
          console.log(`Model ${selectedModel} not available, trying alternatives...`);
          
          for (const altModel of alternativeModels) {
            if (altModel === selectedModel) continue; // Skip if already tried
            
            try {
              response = await fetch(
                `https://generativelanguage.googleapis.com/${apiVersion}/models/${altModel}:generateContent`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "X-goog-api-key": geminiApiKey  // Use header instead of query parameter
                  },
                  body: JSON.stringify({
                    contents: [{
                      parts: [{
                        text: prompt
                      }]
                    }]
                  })
                }
              );
              
              if (response.ok) {
                console.log(`Successfully using model: ${altModel}`);
                break; // Found a working model
              }
            } catch (err) {
              console.error(`Failed to try model ${altModel}:`, err);
            }
          }
        }
        
        if (!response.ok) {
          const finalErrorData = await response.json().catch(() => ({}));
          console.error('Gemini API error:', finalErrorData);
          
          // Handle specific error types
          let finalErrorMessage = finalErrorData.error?.message || initialErrorMessage || `HTTP ${response.status}: ${response.statusText}`;
          let suggestion = '';
          
          if (response.status === 429) {
            finalErrorMessage = 'Rate limit exceeded. Too many requests to Gemini API.';
            suggestion = 'Please wait a few moments before trying again, or check your API quota at https://aistudio.google.com/app/apikey';
          } else if (response.status === 401 || response.status === 403) {
            finalErrorMessage = 'Invalid or unauthorized API key.';
            suggestion = 'Please check your GOOGLE_API_KEY in your .env.local file. Make sure it\'s correct and has the necessary permissions.';
          } else if (response.status === 404) {
            suggestion = 'Please check available models at https://ai.google.dev/models/gemini or try using a different model name.';
          }
          
          return NextResponse.json(
            { 
              error: 'Google Gemini API error', 
              details: finalErrorMessage,
              suggestion: suggestion,
              statusCode: response.status
            },
            { status: response.status || 500 }
          );
        }
      }

      const result = await response.json();
      outputText = result.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!outputText) {
        return NextResponse.json(
          { error: 'No response from Gemini', details: 'The model did not return any content' },
          { status: 500 }
        );
      }
    } else if (openRouterApiKey) {
      // Use OpenRouter API as fallback
      console.log('Using OpenRouter API, key length:', openRouterApiKey.length);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "arcee-ai/trinity-mini:free",
          "messages": [
            {
              "role": "user",
              "content": JSON.stringify(jsonConfig) + PROMPT
            }
          ],
          "reasoning": { "enabled": true }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenRouter API error:', errorData);
        
        let errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
        let suggestion = '';
        
        if (response.status === 429) {
          errorMessage = 'Rate limit exceeded. Too many requests to OpenRouter API.';
          suggestion = 'Please wait a few moments before trying again, or check your OpenRouter account limits.';
        } else if (response.status === 401 || response.status === 403) {
          errorMessage = 'Invalid or unauthorized API key.';
          suggestion = 'Please check your OPENROUTER_API_KEY in your .env.local file.';
        }
        
        return NextResponse.json(
          { 
            error: 'OpenRouter API error', 
            details: errorMessage,
            suggestion: suggestion,
            statusCode: response.status
          },
          { status: response.status || 500 }
        );
      }

      const result = await response.json();
      outputText = result.choices[0]?.message?.content;
    } else {
      return NextResponse.json(
        { 
          error: 'No API key configured', 
          details: 'Please set either GOOGLE_API_KEY (or GEMINI_API_KEY) or OPENROUTER_API_KEY in your .env.local file' 
        },
        { status: 500 }
      );
    }
    
    if (!outputText) {
      return NextResponse.json(
        { error: 'No response from AI', details: 'The AI model did not return any content' },
        { status: 500 }
      );
    }

    // Parse this response to json
    let parsedJson;
    try {
      // Remove markdown code blocks if present
      let cleanedText = outputText.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }
      
      parsedJson = JSON.parse(cleanedText);
    } catch (parseErr: any) {
      console.error('JSON Parse Error:', parseErr);
      console.error('Raw AI Response:', outputText);
      return NextResponse.json(
        { 
          error: 'Failed to parse JSON from AI response', 
          details: parseErr?.message || 'Invalid JSON format',
          rawResponse: outputText.substring(0, 500) // First 500 chars for debugging
        },
        { status: 500 }
      );
    }

    return NextResponse.json(parsedJson);
  } catch (err: any) {
    console.error('API Route Error:', err);
    
    // Handle fetch/network errors
    if (err instanceof TypeError && err.message.includes('fetch')) {
      return NextResponse.json(
        { 
          error: 'Network error', 
          details: 'Failed to connect to the AI API. Please check your internet connection.'
        },
        { status: 500 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { 
        error: 'Failed to process request', 
        details: err?.message || 'Unknown error occurred',
        type: err?.name || 'Error'
      },
      { status: 500 }
    );
  }
}