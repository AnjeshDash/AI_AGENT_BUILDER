"use client"
import React, { useCallback, useContext, useEffect, useState, useRef } from "react";
import Header from "../_component/Header";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Background,
  MiniMap,
  Controls,
  Panel,
  Edge,
  Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import StartNode from "../_customNode/StartNode";
import AgentNode from "../_customNode/AgentNode";
import AgentToolsPanel from "../_component/AgentToolsPanel";
import { WorkflowContext } from "@/app/context/WorkflowContext";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useParams } from "next/navigation";
import { Agent } from "@/app/types/AgentType";
import EndNode from "../_customNode/EndNode";
import IfElseNode from "../_customNode/IfElseNode";
import WhileNode from "../_customNode/WhileNode";
import UserApprovalNode from "../_customNode/UserApprovalNode";
import ApiNode from "../_customNode/ApiNode";

//const initialNodes = [];

const initialEdges = [
  { id: "n1-n2", source: "n1", target: "n2" }
];

const nodeTypes = {
  StartNode,
  AgentNode,
  EndNode,
  IfElseNode,
  WhileNode,
  UserApprovalNode,
  ApiNode
};

function AgentBuilder() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const isUpdatingFromContext = useRef(false);
  const prevAddedNodesRef = useRef<any[]>([]);
  const UpdateAgentDetail=useMutation(api.agent.UpdateAgentDetail)

      const context = useContext(WorkflowContext);
      const {agentId} = useParams();
      const {addedNodes, setAddedNodes, nodeEdges, setNodeEdges} = context || {addedNodes: [], setAddedNodes: () => {}}
      const agentDetail = useQuery(
        api.agent.GetAgentById,
        agentId ? { agentId: agentId as string } : "skip"
      );
      const hasLoadedFromDb = useRef(false);

      // Load nodes and edges from database when agentDetail is fetched
      useEffect(() => {
        if (agentDetail && !hasLoadedFromDb.current) {
          // Load nodes from database if they exist and have content
          if (agentDetail.nodes && Array.isArray(agentDetail.nodes) && agentDetail.nodes.length > 0) {
            isUpdatingFromContext.current = true;
            setNodes(agentDetail.nodes);
            prevAddedNodesRef.current = agentDetail.nodes;
            hasLoadedFromDb.current = true;
          } else if (agentDetail.nodes === undefined || (Array.isArray(agentDetail.nodes) && agentDetail.nodes.length === 0)) {
            // New agent or empty nodes - initialize with Start node from context
            if (addedNodes && Array.isArray(addedNodes) && addedNodes.length > 0) {
              isUpdatingFromContext.current = true;
              setNodes(addedNodes);
              prevAddedNodesRef.current = addedNodes;
            }
            hasLoadedFromDb.current = true;
          }
          
          // Load edges from database if they exist
          if (agentDetail.edges && Array.isArray(agentDetail.edges) && agentDetail.edges.length > 0) {
            setEdges(agentDetail.edges);
          } else {
            setEdges([]);
          }
        }
      }, [agentDetail, addedNodes])

      // Sync from context to local state
      useEffect(()=>{
        if (addedNodes && Array.isArray(addedNodes)) {
          // Check if context has new nodes that aren't in local state
          const contextIds = addedNodes.map((n: any) => n.id).sort().join(',');
          const localIds = nodes.map((n: any) => n.id).sort().join(',');
          const hasNewNodes = contextIds !== localIds;
          
          console.log('Context sync check:', {
            contextNodeCount: addedNodes.length,
            localNodeCount: nodes.length,
            hasNewNodes,
            hasLoadedFromDb: hasLoadedFromDb.current,
            contextIds,
            localIds
          });
          
          // Always update if context changed (new nodes added or nodes modified)
          if (hasNewNodes || !hasLoadedFromDb.current) {
            console.log('Syncing nodes from context to local state', addedNodes);
            isUpdatingFromContext.current = true;
            prevAddedNodesRef.current = addedNodes;
            setNodes(addedNodes);
          }
        }
      },[addedNodes])

      // Sync from local state to context (but not when updating from context)
      useEffect(() => {
        if (!isUpdatingFromContext.current && setAddedNodes && typeof setAddedNodes === 'function') {
          const localChanged = JSON.stringify(prevAddedNodesRef.current) !== JSON.stringify(nodes);
          if (localChanged) {
            setAddedNodes(nodes);
            prevAddedNodesRef.current = nodes;
          }
        }
        // Reset flag after sync
        isUpdatingFromContext.current = false;
      }, [nodes, setAddedNodes])

      useEffect(()=>{
        edges&&setNodeEdges(edges);
        edges&&console.log(edges)
      },[edges])

      // Clean data to remove React-specific properties that Convex can't save
      const cleanForConvex = (obj: any): any => {
        if (obj === null || obj === undefined) {
          return obj;
        }
        
        // Handle arrays
        if (Array.isArray(obj)) {
          return obj.map(item => cleanForConvex(item)).filter(item => item !== undefined);
        }
        
        // Handle objects
        if (typeof obj === 'object' && obj.constructor === Object) {
          const cleaned: any = {};
          for (const key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            
            // Skip properties that start with $ (reserved in Convex)
            if (key.startsWith('$')) {
              continue;
            }
            // Skip React-specific properties
            if (key === '$$typeof' || key === '_owner' || key === '_store') {
              continue;
            }
            // Skip functions
            if (typeof obj[key] === 'function') {
              continue;
            }
            // Recursively clean nested objects
            const cleanedValue = cleanForConvex(obj[key]);
            if (cleanedValue !== undefined) {
              cleaned[key] = cleanedValue;
            }
          }
          return cleaned;
        }
        
        // Return primitives as-is (but skip functions)
        if (typeof obj === 'function') {
          return undefined;
        }
        
        return obj;
      }

      const SaveNodesAndEdges = async() => {
        if (!agentDetail?._id) {
          console.log('Cannot save: agentDetail._id not available');
          return;
        }
        if (!Array.isArray(nodes) || !Array.isArray(edges)) {
          console.log('Cannot save: nodes or edges are not arrays', { nodes, edges });
          return;
        }
        
        try {
          // Clean nodes and edges before saving (remove React-specific properties)
          const cleanedNodes = cleanForConvex(nodes) || [];
          const cleanedEdges = cleanForConvex(edges) || [];
          
          // Ensure we have valid arrays
          if (!Array.isArray(cleanedNodes) || !Array.isArray(cleanedEdges)) {
            console.error('Cleaned data is not arrays:', { cleanedNodes, cleanedEdges });
            alert('Error: Failed to clean data for saving');
            return;
          }
          
          console.log('Saving nodes and edges:', { 
            nodeCount: cleanedNodes.length, 
            edgeCount: cleanedEdges.length,
            sampleNode: cleanedNodes[0],
            nodes: JSON.stringify(cleanedNodes, null, 2),
            edges: JSON.stringify(cleanedEdges, null, 2)
          });
          
          const result = await UpdateAgentDetail({
            id: agentDetail._id,
            edges: cleanedEdges,
            nodes: cleanedNodes
          })
          console.log('Saved successfully:', result);
        } catch (error) {
          console.error('Error saving nodes and edges:', error);
        }
      }

      // Auto-save after changes (debounced) and save initial Start node for new agents
      useEffect(()=>{
        if (!agentDetail?._id) {
          return;
        }
        
        // For new agents: if we have nodes but DB doesn't, save them immediately
        if (hasLoadedFromDb.current && nodes.length > 0) {
          const hasNodesInDb = agentDetail.nodes && Array.isArray(agentDetail.nodes) && agentDetail.nodes.length > 0;
          if (!hasNodesInDb && nodes.length > 0) {
            // New agent with initial Start node - save it
            const timeoutId = setTimeout(() => {
              SaveNodesAndEdges();
            }, 1000);
            return () => clearTimeout(timeoutId);
          }
        }
        
        // Don't auto-save if nodes array is empty
        if (nodes.length === 0) {
          return;
        }
        
        // Wait a bit after DB loads before allowing auto-save
        if (!hasLoadedFromDb.current) {
          const checkDb = setTimeout(() => {
            hasLoadedFromDb.current = true;
          }, 1000);
          return () => clearTimeout(checkDb);
        }
        
        const timeoutId = setTimeout(() => {
          SaveNodesAndEdges();
        }, 2000); // Wait 2 seconds after last change before auto-saving

        return () => clearTimeout(timeoutId);
      },[nodes, edges, agentDetail?._id, agentDetail?.nodes])
  
  const onNodesChange = useCallback(
    (changes: any) => {
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot));
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((edgesSnapshot) => 
        { const updated = applyEdgeChanges(changes, edgesSnapshot)
          setAddedNodes(updated);
          return updated;
        }
  ),
    [setAddedNodes]
  );

  const onConnect = useCallback(
    //@ts-ignore
    (params: any) =>setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  // ✅ Click edge to disconnect
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: any) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    []
  );

  return (
    <div>
      <Header agentDetail={agentDetail} onSave={SaveNodesAndEdges}/>
      <div style={{ width: "100vw", height: "90vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <MiniMap />
          <Controls />
          {/* @ts-ignore */}
          <Background variant="dots" gap={12} size={1} />
          <Panel position='top-left'>
            <AgentToolsPanel/>
          </Panel>
          <Panel position='top-right'>
            Settings
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
}

export default AgentBuilder;
