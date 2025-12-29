import { Handle, Position } from '@xyflow/react'
import { MousePointer2 } from 'lucide-react'
import React from 'react'

function AgentNode() {
  return (
    <div className='bg-white rounded-2xl p-2 px-3 border relative'>
      <Handle type='target' position={Position.Left} />
      <Handle type='source' position={Position.Right} />

      <div className='flex gap-2 items-center'>
        <MousePointer2 className='p-2 rounded-lg h-8 w-8 bg-green-100' />
        <h2>Agent</h2>
      </div>
    </div>
  )
}

export default AgentNode
