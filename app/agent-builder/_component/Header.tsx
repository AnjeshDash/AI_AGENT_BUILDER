import { Agent } from '@/app/types/AgentType'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Code2, Play, Save } from 'lucide-react'
import React from 'react'

type Props={
  agentDetail:Agent|undefined
  onSave?: () => void
}
function Header({agentDetail, onSave}:Props) {
  return (
    <div className='w-full p-3 flex items-center justify-between'>
      <div className='flex gap-2 items-center'>
        <ChevronLeft className='h-8 w-8'/>
        <h2 className='text-xl'>{agentDetail?.name}</h2>
      </div>
      <div className='flex items-center gap-3'>
        {onSave && (
          <Button variant={'outline'} onClick={onSave}>
            <Save className='mr-2 h-4 w-4'/> Save
          </Button>
        )}
        <Button variant={'ghost'}><Code2/>Code</Button>
        <Button><Play/> Preview </Button>
        <Button>Publish</Button>
      </div>
    </div>
  )
}

export default Header
