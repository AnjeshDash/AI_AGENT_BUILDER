import { WorkflowContext } from "@/app/context/WorkflowContext";
import { useContext } from "react";
import AgentSettings from "../_nodeSettings/AgentSettings";
import EndSettings from "../_nodeSettings/EndSettings";
import IfElseSettings from "../_nodeSettings/IfElseSettings";
import WhileSettings from "../_nodeSettings/WhileSettings";
import UserApproval from "../_nodeSettings/UserApproval";
import ApiAgentSettings from "../_nodeSettings/ApiSettings";

type SettingPannelProps = {
  onSave?: () => void;
};

function SettingPannel({ onSave }: SettingPannelProps) {
  const context = useContext(WorkflowContext);
  const { selectedNode, setAddedNodes } = context || {
    selectedNode: null,
    setAddedNodes: () => {},
  };

  const onUpdateNodeData = (formData: any, shouldSaveToDb: boolean = false) => {
    if (!selectedNode || !setAddedNodes) {
      console.error('Cannot update node: selectedNode or setAddedNodes is missing');
      return;
    }

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
          return updatedNode;
        }
        return node;
      });
      
      // If shouldSaveToDb is true, trigger the save function with the updated nodes
      if (shouldSaveToDb && onSave) {
        // Use a longer timeout to ensure React has updated the context state
        setTimeout(() => {
          onSave();
        }, 600);
      }
      
      return updatedNodes;
    });
  };

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
      ) : null}
      {selectedNode?.type === 'IfElseNode' && (
        <IfElseSettings
          selectedNode={selectedNode}
          updateFormData={(formData: any) => onUpdateNodeData(formData, true)}
        />
      )}
      {selectedNode?.type === 'WhileNode' && (
        <WhileSettings
          selectedNode={selectedNode}
          updateFormData={(formData: any) => onUpdateNodeData(formData, true)}
        />
      )}
      {selectedNode?.type === 'UserApprovalNode' && (
        <UserApproval
          selectedNode={selectedNode}
          updateFormData={(formData: any) => onUpdateNodeData(formData, true)}
        />
      )}
      {selectedNode?.type === 'ApiNode' && (
        <ApiAgentSettings
          selectedNode={selectedNode}
          updateFormData={(formData: any) => onUpdateNodeData(formData, true)}
        />
      )}
    </div>
  );
}

export default SettingPannel;
