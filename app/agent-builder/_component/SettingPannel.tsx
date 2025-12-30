import { WorkflowContext } from "@/app/context/WorkflowContext";
import React, { useContext } from "react";
import AgentSettings from "../_nodeSettings/AgentSettings";

function SettingPannel() {
  const context = useContext(WorkflowContext);
  const { selectedNode, setAddedNodes, addedNodes } = context || { 
    selectedNode: null, 
    setAddedNodes: () => {}, 
    addedNodes: [] 
  };

  const onUpdateNodeData = (formData: any) => {
    if (!selectedNode || !setAddedNodes) return;
    
    setAddedNodes((prevNodes: any) =>
      prevNodes.map((node: any) => {
        if (node.id === selectedNode.id) {
          // Preserve all existing node properties (including position) and only update data
          return {
            ...node, // This preserves position, type, id, and all other properties
            data: {
              ...node.data, // Preserve existing data properties
              label: formData.name || node.data?.label || selectedNode.data?.label,
              settings: formData,
            },
          };
        }
        return node;
      })
    );
  };

  return (
    <div className="p-5 bg-white rounded-2xl w-100 shadow">
      {selectedNode && selectedNode.type === "AgentNode" ? (
        <AgentSettings
          selectedNode={selectedNode}
          updateFormData={onUpdateNodeData}
        />
      ) : (
        <div className="text-gray-500 text-center py-10">
          {selectedNode 
            ? `Settings for ${selectedNode.type} are not available yet`
            : "Select a node to view settings"}
        </div>
      )}
    </div>
  );
}

export default SettingPannel;