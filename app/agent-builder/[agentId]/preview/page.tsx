"use client";
import React, { useEffect, useState, useCallback } from "react";
import Header from "../../_component/Header";
import { api } from "@/convex/_generated/api";
import { useQuery, useMutation } from "convex/react";
import { useParams } from "next/navigation";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import { nodeTypes } from "../page";
import { Agent } from "@/app/types/AgentType";
import "@xyflow/react/dist/style.css";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { RefreshCcwIcon } from "lucide-react";
import { toast } from "sonner";
import ChatUI from "./_components/ChatUI";

function PreviewAgent() {
  const { agentId } = useParams();
  const [flowConfig, setFlowConfig] = React.useState<any>(null);
  const [loading, setLoading] = useState(false);

  const agentDetail = useQuery(
    api.agent.GetAgentById,
    agentId ? { agentId: agentId as string } : "skip"
  );

  const updateAgentToolConfig = useMutation(api.agent.UpdateAgentToolConfig);

  // Store generated workflow config
  const [config, setConfig] = useState<any>();

  // Generate workflow config (node/edge relationship)
  const GenerateWorkflow = useCallback(() => {
    if (!agentDetail) return;

    // Build Edge Map for quick source → target lookup
    const edgeMap = agentDetail?.edges?.reduce((acc: any, edge: any) => {
      if (!acc[edge.source]) acc[edge.source] = [];
      acc[edge.source].push(edge);
      return acc;
    }, {});

    // Build flow array by mapping each node
    const flow = agentDetail?.nodes?.map((node: any) => {
      const connectedEdges = edgeMap[node.id] || [];
      let next: any = null;

      switch (node.type) {
        // Conditional branching node with "if" and "else"
        case "IfElseNode": {
          const ifEdge = connectedEdges.find(
            (e: any) => e.sourceHandle === "if"
          );
          const elseEdge = connectedEdges.find(
            (e: any) => e.sourceHandle === "else"
          );

          next = {
            if: ifEdge?.target || null,
            else: elseEdge?.target || null,
          };
          break;
        }

        // Agent or AI Node
        case "AgentNode": {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          } else if (connectedEdges.length > 1) {
            next = connectedEdges.map((e: any) => e.target);
          }
          break;
        }

        // API Call Node
        case "ApiNode": {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          }
          break;
        }

        // User Approval Node (manual checkpoint)
        case "UserApprovalNode": {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          }
          break;
        }

        // Start Node
        case "StartNode": {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          }
          break;
        }

        // End Node
        case "EndNode": {
          next = null; // No next node
          break;
        }

        // Default handling for any unknown node type
        default: {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          } else if (connectedEdges.length > 1) {
            next = connectedEdges.map((e: any) => e.target);
          }
          break;
        }
      }

      // Return a simplified node configuration
      return {
        id: node.id,
        type: node.type,
        label: node.data?.label || node.type,
        settings: node.data?.settings || {},
        next,
      };
    });

    // Find the Start Node
    const startNode = agentDetail?.nodes?.find(
      (n: any) => n.type === "StartNode"
    );

    // Final Config structure
    const workflowConfig = {
      startNode: startNode?.id || null,
      flow,
    };

    setFlowConfig(workflowConfig);

    console.log("✅ Generated Workflow Config:", workflowConfig);
    setConfig(workflowConfig);
  }, [agentDetail]);

  // Generate workflow once agent data is loaded
  useEffect(() => {
    if (agentDetail) {
      GenerateWorkflow();
    }
  }, [agentDetail, GenerateWorkflow]);

  const GenerateAgentToolConfig = async () => {
    if (!agentDetail) {
      toast.error("Cannot generate config: Agent details are missing");
      return;
    }

    if (!flowConfig || !flowConfig.flow || !Array.isArray(flowConfig.flow)) {
      toast.error("Cannot generate config: Flow config is invalid. Please ensure your workflow has nodes.");
      console.error("Invalid flowConfig:", flowConfig);
      return;
    }

    setLoading(true);

    try {
      console.log("Sending flowConfig to API:", flowConfig);
      
      // Generate agent tool config from AI
      const result = await axios.post(
        "/api/arcjet/generate-agent-tool-config",
        {
          jsonConfig: flowConfig,
        }
      );

      if (result.data && !result.data.error) {
        // Update to DB
        await updateAgentToolConfig({
          id: agentDetail._id,
          agentToolConfig: result.data,
        });

        toast.success("Agent tool config generated and saved successfully!");
        console.log("✅ Agent tool config saved successfully:", result.data);
      } else {
        const errorMessage = result.data?.error || "Unknown error occurred";
        const errorDetails = result.data?.details ? `: ${result.data.details}` : "";
        toast.error(`Failed to generate config${errorDetails}`);
        console.error("Error from API:", result.data);
      }
    } catch (error: any) {
      console.error("Full error object:", error);
      
      // Extract error message from response
      let errorMessage = "Failed to generate agent tool config";
      let suggestion = "";
      
      if (error?.response?.data) {
        const errorData = error.response.data;
        errorMessage = errorData.error || errorMessage;
        
        if (errorData.details) {
          errorMessage += `: ${errorData.details}`;
        }
        
        if (errorData.suggestion) {
          suggestion = errorData.suggestion;
        }
        
        // Handle specific status codes
        if (error?.response?.status === 429) {
          errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
          suggestion = errorData.suggestion || "You've made too many requests. Please wait a few seconds before trying again.";
        } else if (error?.response?.status === 401 || error?.response?.status === 403) {
          errorMessage = "API key authentication failed. Please check your API key.";
          suggestion = errorData.suggestion || "Verify your API key in your .env.local file is correct and has the necessary permissions.";
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Show error with suggestion if available
      if (suggestion) {
        toast.error(`${errorMessage}\n${suggestion}`, { duration: 5000 });
      } else {
        toast.error(errorMessage);
      }
      
      console.error("Failed to generate agent tool config:", {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header
        previewHeader={true}
        agentDetail={agentDetail as Agent | undefined}
      />
      <div className="grid grid-cols-4 ">
        <div className="col-span-3 p-5 border rounded-2xl m-5">
          <h2>Preview</h2>
          <div style={{ width: "100%", height: "80vh" }}>
            <ReactFlow
              nodes={agentDetail?.nodes || []}
              edges={agentDetail?.edges || []}
              nodeTypes={nodeTypes}
              nodesDraggable={false}
              nodesConnectable={false}
              elementsSelectable={false}
              fitView
            >
              <Background />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>
        <div className="col-span-1 border rounded-2xl m-5 p-5 flex flex-col h-[calc(80vh+2.5rem)]">
          {!agentDetail?.agentToolConfig ? (
            <div className="flex items-center justify-center h-full">
              <Button 
                onClick={GenerateAgentToolConfig}
                disabled={loading}
              >
                <RefreshCcwIcon className={loading ? "animate-spin mr-2" : "mr-2"} />
                Reboot Agent
              </Button>
            </div>
          ) : (
            <ChatUI 
              agentDetail={agentDetail} 
              agentToolConfig={agentDetail.agentToolConfig}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default PreviewAgent;
