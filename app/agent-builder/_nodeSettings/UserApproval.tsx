import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileJson } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner';

function UserApproval({selectedNode,updateFormData}:any) {
  const [formData, setFormData] = useState({ name:"", message:'' });
  const isSavingRef = useRef(false);
  const prevNodeIdRef = useRef<string | null>(null);
  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  useEffect(() => {
    // Only load settings when:
    // 1. Node ID changes (different node selected)
    // 2. Settings exist and we're not in the middle of saving
    const currentNodeId = selectedNode?.id;
    const hasNodeChanged = currentNodeId !== prevNodeIdRef.current;

    if (hasNodeChanged) {
      prevNodeIdRef.current = currentNodeId;
      isSavingRef.current = false;

      // Load settings for the new node
      if (selectedNode?.data?.settings) {
        console.log(
          "Loading User Approval settings from selectedNode:",
          selectedNode.data.settings
        );
        setFormData(selectedNode.data.settings);
      } else {
        console.log(
          "No settings found for User Approval node, initializing with defaults"
        );
        setFormData({ name: '', message: '' });
      }
    } else if (!isSavingRef.current && selectedNode?.data?.settings) {
      // Only update if settings changed and we're not saving
      const settingsName = selectedNode.data.settings.name || "";
      setFormData((prev) => {
        if (prev.name !== settingsName) {
          console.log(
            "Updating User Approval settings from selectedNode:",
            selectedNode.data.settings
          );
          return selectedNode.data.settings;
        }
        return prev;
      });
    }
  }, [selectedNode?.id, selectedNode?.data?.settings?.name]);

  const handleSave = () => {
    if (!updateFormData) {
      console.error("updateFormData is not available");
      toast.error("Failed to save settings");
      return;
    }
    console.log("Saving User Approval settings:", formData);
    isSavingRef.current = true;
    updateFormData(formData);
    toast.success("Settings saved to database!");
  };
  return (
    <div>
      <h2 className="font-bold">User Approval</h2>
      <p className="text-gray-500 mt-1">
        Pause for a human to Approve or Reject a step 
      </p>

      <div className="mt-3 space-y-1">
        <Label>Name</Label>
        <Input
          placeholder="Name" 
          value={formData.name}
          onChange={(event)=>handleChange('name',event.target.value)}
        />
      </div>
      <div className="mt-3 space-y-2">
        <Label>Message</Label>
        <Textarea 
          placeholder="Describe the method to show to the user"
          value={formData.message || ''}
          onChange={(event)=>handleChange('message',event.target.value)} 
        />
        
      </div>
      <Button className="w-full mt-5" onClick={handleSave}>
        Save
      </Button>
    </div>
  )
}

export default UserApproval