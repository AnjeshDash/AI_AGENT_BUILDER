import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agentId, agentConfig, agentToolConfig } = body;

    if (!agentId || !agentConfig) {
      return NextResponse.json(
        { error: "Agent ID and configuration are required" },
        { status: 400 }
      );
    }

    // Generate code based on agent configuration
    const generatedCode = generateAgentCode(agentConfig, agentToolConfig);

    return NextResponse.json({
      success: true,
      code: generatedCode,
      agentId,
    });
  } catch (error: any) {
    console.error("Publish API error:", error);
    return NextResponse.json(
      { error: "Failed to publish agent", details: error.message },
      { status: 500 }
    );
  }
}

function generateAgentCode(agentConfig: any, agentToolConfig: any): string {
  // Generate a React component code for the agent
  const code = `// Auto-generated Agent Code
import React, { useState } from 'react';

export default function AgentComponent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          agentConfig: ${JSON.stringify(agentConfig, null, 2)},
          agentToolConfig: ${JSON.stringify(agentToolConfig || {}, null, 2)}
        })
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, 
        { role: 'user', content: input },
        { role: 'assistant', content: data.response }
      ]);
      setInput('');
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="agent-chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={\`message \${msg.role}\`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <button onClick={handleSend} disabled={loading}>
          {loading ? 'Sending...' : 'Send'}
        </button>
      </div>
    </div>
  );
}`;

  return code;
}

