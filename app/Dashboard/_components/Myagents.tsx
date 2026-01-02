"use client"
import { UserDetailContext } from '@/app/context/UserDetailContext'
import { Agent } from '@/app/types/AgentType';
import { api } from '@/convex/_generated/api';
import { useConvex, useMutation } from 'convex/react';
import { GitBranchPlus, Trash2 } from 'lucide-react';
import React, { useContext, useEffect, useState } from 'react'
import moment from 'moment'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function Myagents() {
  const {userDetail} = useContext(UserDetailContext);
  const [agentList, setAgentList]= useState<Agent[]>([]);
  const [deletingAgentId, setDeletingAgentId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const convex = useConvex();
  const deleteAgent = useMutation(api.agent.DeleteAgent);

  useEffect(()=>{
    userDetail&&GetUserAgents();
  },[userDetail])

  const GetUserAgents=async()=>{
    const result = await convex.query(api.agent.GetUserAgents,{
      userId:userDetail?._id
    });
    console.log(result);
    setAgentList(result);
  }

  const handleDeleteClick = (e: React.MouseEvent, agentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingAgentId(agentId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAgentId) return;
    try {
      const agent = agentList.find(a => a.agentId === deletingAgentId);
      if (agent) {
        await deleteAgent({ id: agent._id });
        toast.success("Agent deleted successfully");
        GetUserAgents();
      }
    } catch (error: any) {
      toast.error("Failed to delete agent: " + (error.message || "Unknown error"));
    } finally {
      setDeleteDialogOpen(false);
      setDeletingAgentId(null);
    }
  };

  if (agentList.length === 0) {
    return (
      <div className='w-full mt-5 text-center py-12'>
        <GitBranchPlus className='h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50'/>
        <h3 className='text-lg font-semibold mb-2'>No agents yet</h3>
        <p className='text-muted-foreground'>Create your first AI agent to get started</p>
      </div>
    );
  }

  return (
    <div className='w-full mt-5'>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
        {agentList.map((agent, index) => (
          <div key={index} className='p-3 border rounded-2xl shadow relative group hover:shadow-lg transition-shadow'>
            <Link href={'/agent-builder/'+agent.agentId} className='block'>
              <GitBranchPlus className='bg-yellow-100 p-2 h-8 w-8 rounded-sm'/>
              <h2 className='mt-3'>{agent.name}</h2>
              <h2 className='text-gray-400 mt-2'>{moment(agent._creationTime).fromNow()}</h2>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleDeleteClick(e, agent.agentId)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this agent? This action cannot be undone.
              All agent configurations and workflows will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default Myagents