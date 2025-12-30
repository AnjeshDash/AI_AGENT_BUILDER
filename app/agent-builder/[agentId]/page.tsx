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
  useOnSelectionChange,
  OnSelectionChangeParams,
  useReactFlow,
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
import SettingPannel from "../_component/SettingPannel";
import { toast } from "sonner";

//const initialNodes = [];


const nodeTypes = {
  StartNode,
  AgentNode,
  EndNode,
  IfElseNode,
  WhileNode,
  UserApprovalNode,
  ApiNode
};

// Helper component to handle fitView after nodes are loaded
function FitViewHelper({ nodes, agentDetail }: { nodes: Node[], agentDetail: Agent | undefined | null }) {
  const { fitView } = useReactFlow();
  const hasFitted = useRef(false);
  const prevNodesLength = useRef(0);

  useEffect(() => {
    // Check if we have nodes from database and they just got loaded
    const nodesFromDb = agentDetail?.nodes && Array.isArray(agentDetail.nodes) && agentDetail.nodes.length > 0;
    const nodesJustLoaded = nodes.length > 0 && prevNodesLength.current === 0 && nodesFromDb;
    
    // Only fit view once when nodes are first loaded from database
    if (nodesJustLoaded && !hasFitted.current && nodes.every((n: any) => n.position)) {
      // Use setTimeout to ensure ReactFlow has rendered the nodes with their positions
      const timer = setTimeout(() => {
        try {
          fitView({ duration: 400, padding: 0.2 });
          hasFitted.current = true;
        } catch (error) {
          console.error('Error fitting view:', error);
        }
      }, 300);
      
      prevNodesLength.current = nodes.length;
      return () => clearTimeout(timer);
    }
    
    if (nodes.length > 0) {
      prevNodesLength.current = nodes.length;
    }
  }, [nodes, agentDetail, fitView]);

  return null;
}

function AgentBuilder() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const isUpdatingFromContext = useRef(false);
  const prevAddedNodesRef = useRef<any[]>([]);
  const hasFittedView = useRef(false);
  const UpdateAgentDetail=useMutation(api.agent.UpdateAgentDetail)

      const context = useContext(WorkflowContext);
      const {agentId} = useParams();
      const {addedNodes, setAddedNodes, nodeEdges, setNodeEdges, setSelectedNode, selectedNode} = context || {addedNodes: [], setAddedNodes: () => {}, selectedNode: null}
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
            // Also update context so it's in sync
            if (setAddedNodes && typeof setAddedNodes === 'function') {
              setAddedNodes(agentDetail.nodes);
            }
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
      }, [agentDetail, addedNodes, setAddedNodes])

      // Sync from context to local state
      useEffect(()=>{
        if (addedNodes && Array.isArray(addedNodes)) {
          // Check if context has new nodes that aren't in local state
          const contextIds = addedNodes.map((n: any) => n.id).sort().join(',');
          const localIds = nodes.map((n: any) => n.id).sort().join(',');
          const hasNewNodes = contextIds !== localIds;
          
          // Check if node data has changed (deep comparison of JSON, excluding position)
          const contextData = JSON.stringify(addedNodes.map((n: any) => ({
            ...n,
            position: undefined // Exclude position from comparison
          })));
          const localData = JSON.stringify(prevAddedNodesRef.current.map((n: any) => ({
            ...n,
            position: undefined
          })));
          const hasNodeDataChanged = contextData !== localData;
          
          console.log('Context sync check:', {
            contextNodeCount: addedNodes.length,
            localNodeCount: nodes.length,
            hasNewNodes,
            hasNodeDataChanged,
            hasLoadedFromDb: hasLoadedFromDb.current,
            contextIds,
            localIds
          });
          
          // Always update if context changed (new nodes added, removed, or nodes modified)
          if (hasNewNodes || hasNodeDataChanged || !hasLoadedFromDb.current) {
            console.log('Syncing nodes from context to local state', addedNodes);
            isUpdatingFromContext.current = true;
            
            // Merge context nodes with local nodes to preserve positions
            const mergedNodes = addedNodes.map((contextNode: any) => {
              const localNode = nodes.find((n: any) => n.id === contextNode.id);
              if (localNode && localNode.position) {
                // Preserve position from local state if it exists
                return {
                  ...contextNode,
                  position: localNode.position,
                  // Also preserve other ReactFlow-specific properties
                  selected: localNode.selected,
                  dragging: localNode.dragging,
                };
              }
              return contextNode;
            });
            
            prevAddedNodesRef.current = mergedNodes;
            setNodes(mergedNodes);
          }
        }
      },[addedNodes, nodes.length])

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
          toast.error('Cannot save: Agent details not available');
          console.log('Cannot save: agentDetail._id not available');
          return;
        }
        
        // Sync latest nodes from context before saving to ensure all settings are included
        let nodesToSave = nodes;
        if (addedNodes && Array.isArray(addedNodes) && addedNodes.length > 0) {
          // Use the latest nodes from context which includes any settings updates
          nodesToSave = addedNodes;
          // Also update local state to keep them in sync
          isUpdatingFromContext.current = true;
          setNodes(addedNodes);
          prevAddedNodesRef.current = addedNodes;
        }
        
        if (!Array.isArray(nodesToSave) || !Array.isArray(edges)) {
          toast.error('Cannot save: Invalid data format');
          console.log('Cannot save: nodes or edges are not arrays', { nodesToSave, edges });
          return;
        }
        
        try {
          // Clean nodes and edges before saving (remove React-specific properties)
          const cleanedNodes = cleanForConvex(nodesToSave) || [];
          const cleanedEdges = cleanForConvex(edges) || [];
          
          // Ensure we have valid arrays
          if (!Array.isArray(cleanedNodes) || !Array.isArray(cleanedEdges)) {
            toast.error('Error: Data cleaning failed');
            console.error('Cleaned data is not arrays:', { cleanedNodes, cleanedEdges });
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
          setIsSaved(true);
          toast.success('All changes saved successfully!');
        } catch (error) {
          console.error('Error saving nodes and edges:', error);
          toast.error('Failed to save changes. Please try again.');
        }
      }

      const deleteSelectedNode = () => {
        if (!selectedNodeId) return;
        
        // Remove the node
        setNodes((nds) => nds.filter((n) => n.id !== selectedNodeId));
        // Remove edges connected to this node
        setEdges((eds) => eds.filter((e) => e.source !== selectedNodeId && e.target !== selectedNodeId));
        setSelectedNodeId(null);
        setIsSaved(false);
      }

      // Track changes to mark as unsaved
      useEffect(() => {
        if (hasLoadedFromDb.current && nodes.length > 0) {
          // Compare with saved data to detect changes
          const savedNodes = agentDetail?.nodes || [];
          const nodesChanged = JSON.stringify(savedNodes) !== JSON.stringify(nodes);
          const edgesChanged = JSON.stringify(agentDetail?.edges || []) !== JSON.stringify(edges);
          
          // Also check if context nodes differ from saved nodes (for settings updates)
          const contextNodesChanged = addedNodes && Array.isArray(addedNodes) 
            ? JSON.stringify(savedNodes) !== JSON.stringify(addedNodes)
            : false;
          
          if (nodesChanged || edgesChanged || contextNodesChanged) {
            setIsSaved(false);
          }
        }
      }, [nodes, edges, agentDetail?.nodes, agentDetail?.edges, addedNodes])
  
  const onNodesChange = useCallback(
    (changes: any) => {
      setNodes((nodesSnapshot) => {
        const updated = applyNodeChanges(changes, nodesSnapshot);
        // Track if data has changed (not saved)
        setIsSaved(false);
        return updated;
      });
      // Handle node selection
      changes.forEach((change: any) => {
        if (change.type === 'select' && change.selected) {
          setSelectedNodeId(change.id);
        } else if (change.type === 'select' && !change.selected) {
          setSelectedNodeId(null);
        }
      });
    },
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((edgesSnapshot) => {
        const updated = applyEdgeChanges(changes, edgesSnapshot);
        setIsSaved(false);
        return updated;
      }),
    []
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

  const onNodeSelect = useCallback(({nodes,edges}:OnSelectionChangeParams)=>{
      if (setSelectedNode && typeof setSelectedNode === 'function') {
        setSelectedNode(nodes[0] || null);
        console.log('Selected node:', nodes[0]);
      }
  },[setSelectedNode])

  useOnSelectionChange({
    onChange:onNodeSelect
  })

  return (
    <div>
      <Header 
        agentDetail={agentDetail} 
        onSave={SaveNodesAndEdges}
        onDeleteNode={selectedNodeId ? deleteSelectedNode : undefined}
        isSaved={isSaved}
      />
      <div style={{ width: "100vw", height: "90vh" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onEdgeClick={onEdgeClick}
          nodeTypes={nodeTypes}
        >
          <FitViewHelper nodes={nodes} agentDetail={agentDetail} />
          <MiniMap />
          <Controls />
          {/* @ts-ignore */}
          <Background variant="dots" gap={12} size={1} />
          <Panel position='top-left'>
            <AgentToolsPanel/>
          </Panel>
          {selectedNode && (
            <Panel position='top-right'>
              <SettingPannel/>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}

export default AgentBuilder;
