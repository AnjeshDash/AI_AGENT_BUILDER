"use client"
import { Button } from '@/components/ui/button'
import { Ghost, Loader2Icon, Plus } from 'lucide-react'
import React, { useContext, useState } from 'react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input';
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation'
import { UserDetailContext } from '@/app/context/UserDetailContext'
import { toast } from 'sonner';


function CreateAgentSection() {
  const [openDialog, setOpenDialogue] = useState(false);
  const CreateAgentMutation=useMutation(api.agent.CreateAgent);
  const [agentName, setAgentName] = useState("")
  const router=useRouter();
  const [loader, setLoader] = useState(false);
  const {userDetail, setUserDetail} = useContext(UserDetailContext);

  const CreateAgent = async () => {
    if (!userDetail?._id) return toast.error('User ID is required to create an agent');
    if (!agentName.trim()) return toast.error('Please enter an agent name');

    setLoader(true);
    try {
      const agentId = uuidv4();
      await CreateAgentMutation({ agentId, name: agentName.trim(), userId: userDetail._id });
      setOpenDialogue(false);
      setAgentName("");
      toast.success('Agent created successfully!');
      router.push('/agent-builder/' + agentId);
    } catch (error: any) {
      toast.error('Failed to create agent: ' + (error.message || 'Unknown error'));
    } finally {
      setLoader(false);
    }
  }
  
  return (
    <div className="space-y-2 flex flex-col justify-center items-center mt-24">
      <h2 className="font-bold text-2xl">Create AI Agent</h2>
      <p className="text-lg">
        Build an AI Agent workflow with custom logic and tools
      </p>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialogue}>
        <DialogTrigger asChild>
        <Button size={"lg"} onClick={() => setOpenDialogue(true)}>
        <Plus />
        Create
      </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Agent Name</DialogTitle>
            <DialogDescription>
              <Input placeholder='Agent Name' onChange={(event)=>setAgentName(event.target.value)}/>
            </DialogDescription>
          </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
          <Button variant='ghost'>Cancel</Button>
          </DialogClose>
          <Button onClick={CreateAgent} disabled={loader}>
            {loader&&<Loader2Icon className='animate-spin'/>}
            Create</Button>
        </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateAgentSection
