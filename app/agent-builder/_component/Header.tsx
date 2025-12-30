import { Agent } from '@/app/types/AgentType'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Code2, Play, Save } from 'lucide-react'

type Props={
  agentDetail:Agent|undefined
  onSave?: () => void
  isSaved?: boolean
}
function Header({agentDetail, onSave, isSaved = true}:Props) {
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
        {onSave && (
          <Button 
            variant={isSaved ? 'outline' : 'default'} 
            onClick={onSave}
            className={!isSaved ? 'bg-black hover:bg-gray-700' : ''}
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
