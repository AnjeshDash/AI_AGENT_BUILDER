import { WorkflowContext } from "@/app/context/WorkflowContext";
import React, { useContext } from "react";
import AgentSettings from "../_nodeSettings/AgentSettings";
import EndSettings from "../_nodeSettings/EndSettings";

type SettingPannelProps = {
  onSave?: () => void;
};

function SettingPannel({ onSave }: SettingPannelProps) {
  const context = useContext(WorkflowContext);
  const { selectedNode, setAddedNodes, addedNodes } = context || {
    selectedNode: null,
    setAddedNodes: () => {},
    addedNodes: [],
  };

  const onUpdateNodeData = (formData: any, shouldSaveToDb: boolean = false) => {
    if (!selectedNode || !setAddedNodes) {
      console.error('Cannot update node: selectedNode or setAddedNodes is missing');
      return;
    }

    console.log('Updating node data:', { nodeId: selectedNode.id, nodeType: selectedNode.type, formData, shouldSaveToDb });

    // Update the nodes in context
    setAddedNodes((prevNodes: any) => {
      const updatedNodes = prevNodes.map((node: any) => {
        if (node.id === selectedNode.id) {
          // Preserve all existing node properties (including position) and only update data
          const updatedNode = {
            ...node, // This preserves position, type, id, and all other properties
            data: {
              ...node.data, // Preserve existing data properties
              // Only update label if formData has a name property (for AgentNode)
              // For EndNode, keep the existing label
              label: formData.name 
                ? formData.name 
                : (node.data?.label || selectedNode.data?.label),
              settings: formData,
            },
          };
          console.log('Updated node with settings:', {
            id: updatedNode.id,
            type: updatedNode.type,
            settings: updatedNode.data.settings
          });
          return updatedNode;
        }
        return node;
      });
      
      // If shouldSaveToDb is true, trigger the save function with the updated nodes
      if (shouldSaveToDb && onSave) {
        // Use a longer timeout to ensure React has updated the context state
        // The updatedNodes are already computed, so we can log them immediately
        console.log('Will trigger database save. Updated nodes with settings:', updatedNodes.map((n: any) => ({
          id: n.id,
          type: n.type,
          hasSettings: !!n.data?.settings,
          settings: n.data?.settings
        })));
        
        setTimeout(() => {
          console.log('Triggering database save after settings update for node:', selectedNode.id);
          onSave();
        }, 600);
      }
      
      return updatedNodes;
    });
  };

  console.log('SettingPannel - selectedNode:', selectedNode, 'type:', selectedNode?.type);

  if (!selectedNode) {
    return null;
  }

  const nodeType = selectedNode.type;

  return (
    <div className="p-5 bg-white rounded-2xl w-100 shadow">
      {nodeType === "AgentNode" ? (
        <AgentSettings
          selectedNode={selectedNode}
          updateFormData={(formData: any) => onUpdateNodeData(formData, true)}
        /> 
      ) : nodeType === "EndNode" ? (
        <EndSettings
          selectedNode={selectedNode}
          updateFormData={(formData: any) => onUpdateNodeData(formData, true)}
        />
      ) : (
        <div className="text-gray-500 text-center py-10">
          Settings for {nodeType || 'unknown'} are not available yet
        </div>
      )}
    </div>
  );
}

export default SettingPannel;
