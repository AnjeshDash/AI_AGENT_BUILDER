import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Handle, Position } from '@xyflow/react'
import { ThumbsUp } from 'lucide-react'
import React from 'react'
const handleStyle={top:110}

function UserApprovalNode({data}:any) {
  return (
    <div className='bg-white rounded-2xl p-2 px-3 border relative'>
      <div className='flex gap-2 items-center'>
        <ThumbsUp className='p-2 rounded-2xl h-8 w-8'
        style={{
          backgroundColor:data?.bgColor
        }}/>
        <h2>User Approval</h2>
      </div>
      <div className='max-w-35 flex flex-col gap-2 mt-2'>
        <Button variant={'outline'} disabled>Approve</Button>
        <Button variant={'outline'} disabled>Reject</Button>
      </div>
      <Handle type='target' position={Position.Left}/>
      <Handle type='source' position={Position.Right} id={'approve'}/>
      <Handle type='source' position={Position.Right}id={'reject'}
      style={handleStyle}/>
    </div>
  )
}

export default UserApprovalNode
