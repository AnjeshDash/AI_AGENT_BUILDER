
import { WorkflowContext } from '@/app/context/WorkflowContext';
import { Merge, MousePointer2, Repeat, Square, ThumbsUp, Webhook, } from 'lucide-react';
import React, { useContext } from 'react'
const AgentTools = [
  {
    name: 'Agent',
    icon: MousePointer2,
    bgColor: '#D0F5E3', // Light mint green
    id: 'agent',
    type: 'AgentNode',
  },
  {
    name: 'End',
    icon: Square,
    bgColor: '#FFE3E3', // Soft pastel red
    id: 'end',
    type: 'EndNode',
  },
  {
    name: 'If/Else',
    icon: Merge,
    bgColor: '#FFF3CD', // Light pastel yellow
    id: 'ifElse',
    type: 'IfElseNode',
  },
  {
    name: 'While',
    icon: Repeat,
    bgColor: '#E3F2FD', // Light blue
    id: 'while',
    type: 'WhileNode',
  },
  {
    name: 'User Approval',
    icon: ThumbsUp,
    bgColor: '#F3E5F5', // Light lavender
    id: 'approval',
    type: 'UserApprovalNode',
  },
  {
    name: 'API',
    icon: Webhook,
    bgColor: '#E0F7FA', // Light cyan
    id: 'api',
    type: 'ApiNode',
  },
];

function AgentToolsPanel() {

  const context = useContext(WorkflowContext);
  const {addedNodes, setAddedNodes} = context || {addedNodes: [], setAddedNodes: () => {}};

  const onAgentToolClick=(tool:any)=>{
    if (!setAddedNodes || typeof setAddedNodes !== 'function') {
      console.error('setAddedNodes is not available');
      return;
    }

    const newNode={
      id:`${tool.id}-${Date.now()}`,
      position:{x:400,y:400},
      data:{label:tool.name,...tool},
      type:tool.type
    }
    
    console.log('Adding new node:', newNode);
    setAddedNodes((prev:any)=>{
      const updated = [...(prev || []), newNode];
      console.log('Updated nodes in context:', updated);
      return updated;
    })

  }

  return (
    <div className='bg-white p-5 rounded-2xl shadow'>
      <h2 className='font-semibold mb-4 text-gray-700'>AI Agent Tools</h2>
      <div>
        {AgentTools.map((tool,index)=>(
          <div key={index} className='flex items-center gap-3 p-2 cursor-pointer hover:bg-gray-100 rounded-xl' onClick={() => onAgentToolClick(tool)}>
            <tool.icon className='p-2 rounded-lg h-8 w-8'
            style={{
              backgroundColor:tool.bgColor
            }}
            />
            <h2 className='text-sm font-medium text-gray-700'>{tool.name}</h2>
          </div>
        ))}
      </div>
    </div>
  )
}

export default AgentToolsPanel
