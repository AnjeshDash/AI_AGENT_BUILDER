"use client";
import { Agent } from '@/app/types/AgentType'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Code2, Play, Save, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import axios from "axios"

type Props={
  agentDetail:Agent|undefined
  onSave?: () => void
  isSaved?: boolean
  previewHeader?:boolean

}
function Header({agentDetail, onSave, isSaved = true,previewHeader=false}:Props) {
  const [publishOpen, setPublishOpen] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePublish = async () => {
    if (!agentDetail) {
      toast.error("Agent details not available");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/agent/publish", {
        agentId: agentDetail.agentId,
        agentConfig: {
          nodes: agentDetail.nodes,
          edges: agentDetail.edges,
        },
        agentToolConfig: agentDetail.agentToolConfig,
      });

      if (response.data.success) {
        setGeneratedCode(response.data.code);
        setPublishOpen(true);
        toast.success("Agent code generated successfully!");
      }
    } catch (error: any) {
      toast.error("Failed to publish agent: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className='w-full p-3 flex items-center justify-between'>
      <div className='flex gap-2 items-center'>
        <Link href="/Dashboard">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className='h-8 w-8'/>
          </Button>
        </Link>
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
        {!previewHeader?<Link href={`/agent-builder/${agentDetail?.agentId}/preview`}>
        <Button><Play/> Preview </Button>
        </Link>:
        <Link href={`/agent-builder/${agentDetail?.agentId}`}>
        <Button variant={'outline'}><X/>Close Preview </Button>
        </Link>}
        <Dialog open={publishOpen} onOpenChange={setPublishOpen}>
          <DialogTrigger asChild>
            <Button onClick={handlePublish} disabled={loading}>
              {loading ? "Generating..." : "Publish"}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>Generated Agent Code</DialogTitle>
              <DialogDescription>
                Copy this code to use your agent in your application
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4">
              <div className="flex justify-end mb-2">
                <Button onClick={copyToClipboard} size="sm">
                  Copy Code
                </Button>
              </div>
              <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
                <code>{generatedCode || "Generating code..."}</code>
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export default Header
