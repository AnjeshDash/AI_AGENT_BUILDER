import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React, { useEffect, useState, useRef } from "react";
import { toast } from "sonner";

function EndSettings({selectedNode, updateFormData}:any) {
  const [formData,setFormData] = useState({schema:''})
  const isSavingRef = useRef(false);
  const prevNodeIdRef = useRef<string | null>(null);
  
  useEffect(()=>{
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
        console.log('Loading End settings from selectedNode:', selectedNode.data.settings);
        setFormData(selectedNode.data.settings);
      } else {
        console.log('No settings found for End node, initializing with empty schema');
        setFormData({schema: ''});
      }
    } else if (!isSavingRef.current && selectedNode?.data?.settings) {
      // Only update if settings changed and we're not saving
      const settingsSchema = selectedNode.data.settings.schema || '';
      setFormData((prev) => {
        if (prev.schema !== settingsSchema) {
          console.log('Updating End settings from selectedNode:', selectedNode.data.settings);
          return selectedNode.data.settings;
        }
        return prev;
      });
    }
  },[selectedNode?.id, selectedNode?.data?.settings?.schema])
  
  const handleSave = () => {
    if (!updateFormData) {
      console.error('updateFormData is not available');
      toast.error('Failed to save settings');
      return;
    }
    console.log('Saving End settings:', formData);
    isSavingRef.current = true;
    updateFormData(formData);
    toast.success("Settings saved to database!");
    
    // Reset the saving flag after a delay to allow the update to complete
    setTimeout(() => {
      isSavingRef.current = false;
    }, 500);
  }
  
  return (
    <div>
      <h2 className="font-bold">End</h2>
      <p className="text-gray-500 mt-1">
        Choose the Workflow output
      </p>
      <div className="mt-2 space-y-2">
        <Label>Output</Label>
        <Textarea 
          placeholder="{name:string}"
          value={formData?.schema || ''}
          onChange={(e)=>setFormData({schema:e.target.value})}
          spellCheck={false}
        />
      </div>
      <Button className="w-full mt-5" onClick={handleSave}>Save</Button>
    </div>
  );
}

export default EndSettings;
