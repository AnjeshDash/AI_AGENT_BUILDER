"use client"
import React, { useCallback, useState } from "react";
import Header from "../_component/Header";
import {
  ReactFlow,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import StartNode from "../_component/StartNode";
import AgentNode from "../_component/AgentNode";

const initialNodes = [
  { id: "n1", position: { x: 0, y: 0 }, data: { label: "Node 1" }, type: "StartNode" },
  { id: "n2", position: { x: 0, y: 100 }, data: { label: "Node 2" }, type: "AgentNode" },
];

const initialEdges = [{ id: "n1-n2", source: "n1", target: "n2" }];

const nodeTypes = {
  StartNode,
  AgentNode,
};

function AgentBuilder() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);

  const onNodesChange = useCallback(
    (changes: any) =>
      setNodes((nodesSnapshot) => applyNodeChanges(changes, nodesSnapshot)),
    []
  );

  const onEdgesChange = useCallback(
    (changes: any) =>
      setEdges((edgesSnapshot) => applyEdgeChanges(changes, edgesSnapshot)),
    []
  );

  const onConnect = useCallback(
    (params: any) =>
      setEdges((edgesSnapshot) => addEdge(params, edgesSnapshot)),
    []
  );

  // 🔹 NEW: Click edge to disconnect
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: any) => {
      setEdges((eds) => eds.filter((e) => e.id !== edge.id));
    },
    []
  );

  return (
    <div>
      <Header />
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
        />
      </div>
    </div>
  );
}

export default AgentBuilder;
