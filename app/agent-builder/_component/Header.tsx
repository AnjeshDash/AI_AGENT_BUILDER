import { Agent } from '@/app/types/AgentType'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Code2, Play, Save, Trash2 } from 'lucide-react'
import React from 'react'

type Props={
  agentDetail:Agent|undefined
  onSave?: () => void
  onDeleteNode?: () => void
  isSaved?: boolean
}
function Header({agentDetail, onSave, onDeleteNode, isSaved = true}:Props) {
  return (
    <div className='w-full p-3 flex items-center justify-between'>
      <div className='flex gap-2 items-center'>
        <ChevronLeft className='h-8 w-8'/>
        <h2 className='text-xl'>{agentDetail?.name}</h2>
        {!isSaved && (
          <span className='text-sm text-orange-500 ml-2'>* Unsaved changes</span>
        )}
      </div>
      <div className='flex items-center gap-3'>
        {onDeleteNode && (
          <Button variant={'destructive'} onClick={onDeleteNode}>
            <Trash2 className='mr-2 h-4 w-4'/> Delete Node
          </Button>
        )}
        {onSave && (
          <Button 
            variant={isSaved ? 'outline' : 'default'} 
            onClick={onSave}
            className={!isSaved ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            <Save className='mr-2 h-4 w-4'/> {isSaved ? 'Saved' : 'Save'}
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
