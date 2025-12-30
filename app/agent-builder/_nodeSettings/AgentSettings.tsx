import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FileJson } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

function AgentSettings({ selectedNode, updateFormData }: any) {
  const [formData,setFormData ] = useState({
    name:'',
    instruction:'',
    includeHistory:true,
    model:'gemini-flash-1.5',
    output:'text',
    schema:''
  })
  const isSavingRef = useRef(false);
  const prevNodeIdRef = useRef<string | null>(null);

  useEffect(()=>{
    const currentNodeId = selectedNode?.id;
    const hasNodeChanged = currentNodeId !== prevNodeIdRef.current;
    
    if (hasNodeChanged) {
      prevNodeIdRef.current = currentNodeId;
      isSavingRef.current = false;
    }
    
    if (!isSavingRef.current) {
      if (selectedNode?.data?.settings) {
        console.log('Loading Agent settings from selectedNode:', selectedNode.data.settings);
        setFormData(selectedNode.data.settings);
      } else if (hasNodeChanged) {
        // Reset to defaults if no settings exist (only on new node selection)
        setFormData({
          name: selectedNode?.data?.label || '',
          instruction:'',
          includeHistory:true,
          model:'gemini-flash-1.5',
          output:'text',
          schema:''
        });
      }
    }
  },[selectedNode?.id, selectedNode?.data?.settings])

  const handleChange=(key:string,value:any)=>{
    setFormData((prev)=>({
      ...prev,
      [key]:value
    }))
  }
  const onSave=()=>{
    if (!updateFormData) {
      console.error('updateFormData is not available');
      toast.error('Failed to save settings');
      return;
    }
    console.log('Saving Agent settings:', formData);
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
      <h2 className="font-bold">Agent</h2>
      <p className="text-gray-500 mt-1">
        Call the AI model with your instruction
      </p>
      <div className="mt-3 space-y-2">
        <Label>Name</Label>
        <Input 
          placeholder="Agent Name" 
          value={formData.name}
          onChange={(event)=>handleChange('name',event.target.value)}
        />
      </div>
      <div className="mt-3 space-y-2">
        <Label>Instruction</Label>
        <Textarea 
          placeholder="Instruction"
          value={formData.instruction}
          onChange={(event)=>handleChange('instruction',event.target.value)} 
        />
        <h2 className="text-sm p-1 flex gap-2 items-center" >
          Add Context
          <FileJson className="h-3 w-3" />
        </h2>
      </div>
      <div className="mt-3 flex justify-between items-center">
        <Label>Include Chat History</Label>
        <Switch 
          checked={formData.includeHistory} 
          onCheckedChange={(checked)=>handleChange('includeHistory',checked)}
        />
      </div>
      <div className="mt-3 flex justify-between items-center">
        <Label>Model</Label>
        <Select 
          value={formData.model}
          onValueChange={(value)=>handleChange('model',value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="gemini flash 1.5"></SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="gemini-flash-1.5">Gemini flash 1.5</SelectItem>
            <SelectItem value="gemini-pro-1.5">Gemini Pro 1.5</SelectItem>
            <SelectItem value="gemini-pro-2.0">Gemini Pro 2.0</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="mt-3 space-y-2">
        <Label>Output Format</Label>
        <Tabs 
          value={formData.output === 'json' ? 'Json' : 'Text'} 
          className="w-100" 
          onValueChange={(value)=>handleChange('output', value.toLowerCase())}
        >
          <TabsList>
            <TabsTrigger value="Text">Text</TabsTrigger>
            <TabsTrigger value="Json">Json</TabsTrigger>
          </TabsList>
          <TabsContent value="Text">
            <h2 className="text-sm text-gray-500">Output will be Text.</h2>
          </TabsContent>
          <TabsContent value="Json">
            <Label className="text-sm text-gray-500">Enter Json Schema</Label>
            <Textarea 
              placeholder="{title:string}" 
              value={formData.schema}
              onChange={(event)=>handleChange('schema',event.target.value)}
              className="max-w-75 mt-1"
            />
          </TabsContent>
        </Tabs>
      </div>
      <Button className="w-full mt-5" onClick={onSave}>Save</Button>
    </div>
  );
}

export default AgentSettings;
