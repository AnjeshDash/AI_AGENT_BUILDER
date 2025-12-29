import { Handle, Position } from '@xyflow/react'
import { Square } from 'lucide-react'
import React from 'react'

function EndNode({data}:any) {
  return (
    <div className='bg-white rounded-2xl p-2 px-3 border relative'>
          <Handle type='target' position={Position.Left} />
    
          <div className='flex gap-2 items-center'>
            <Square className='p-2 rounded-lg h-8 w-8 '
            style={{
              backgroundColor:data?.bgColor
            }} />
            <h2>End</h2>
          </div>
        </div>
  )
}

export default EndNode
