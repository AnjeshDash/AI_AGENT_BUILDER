"use client";
import React, { useEffect, useState, useCallback } from "react";
import Header from "../../_component/Header";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { useParams } from "next/navigation";
import { ReactFlow, Background, Controls, MiniMap } from "@xyflow/react";
import { nodeTypes } from "../page";
import { Agent } from "@/app/types/AgentType";
import "@xyflow/react/dist/style.css";

function PreviewAgent() {
  const { agentId } = useParams();

  const agentDetail = useQuery(
    api.agent.GetAgentById,
    agentId ? { agentId: agentId as string } : "skip"
  );

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
        case 'IfElseNode': {
          const ifEdge = connectedEdges.find(
            (e: any) => e.sourceHandle === 'if'
          );
          const elseEdge = connectedEdges.find(
            (e: any) => e.sourceHandle === 'else'
          );

          next = {
            if: ifEdge?.target || null,
            else: elseEdge?.target || null
          };
          break;
        }

        // Agent or AI Node
        case 'AgentNode': {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          } else if (connectedEdges.length > 1) {
            next = connectedEdges.map((e: any) => e.target);
          }
          break;
        }

        // API Call Node
        case 'ApiNode': {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          }
          break;
        }

        // User Approval Node (manual checkpoint)
        case 'UserApprovalNode': {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          }
          break;
        }

        // Start Node
        case 'StartNode': {
          if (connectedEdges.length === 1) {
            next = connectedEdges[0].target;
          }
          break;
        }

        // End Node
        case 'EndNode': {
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
        next
      };
    });

    // Find the Start Node
    const startNode = agentDetail?.nodes?.find(
      (n: any) => n.type === 'StartNode'
    );

    // Final Config structure
    const workflowConfig = {
      startNode: startNode?.id || null,
      flow
    };

    console.log('✅ Generated Workflow Config:', workflowConfig);
    setConfig(workflowConfig);
  }, [agentDetail]);

  // Generate workflow once agent data is loaded
  useEffect(() => {
    if (agentDetail) {
      GenerateWorkflow();
    }
  }, [agentDetail, GenerateWorkflow]);

  return (
    <div>
      <Header previewHeader={true} agentDetail={agentDetail} />
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
        <div className="col-span-1 border rounded-2xl m-5 p-5">
          CHAT UI
        </div>
      </div> 
    </div>
  );
}

export default PreviewAgent;
