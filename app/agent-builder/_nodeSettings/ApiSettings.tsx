"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import React, { useEffect, useRef, useState } from 'react'
import { FileJson } from 'lucide-react'

function ApiAgentSettings({ selectedNode, updateFormData }: any) {
  const [formData, setFormData] = useState({
    name: '',
    method: 'GET',
    url: '',
    apiKey: '',
    includeApiKey: true,
    bodyParams: ''
  })
  const isSavingRef = useRef(false);
  const prevNodeIdRef = useRef<string | null>(null);

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
          "Loading API Agent settings from selectedNode:",
          selectedNode.data.settings
        );
        setFormData(selectedNode.data.settings);
      } else {
        console.log(
          "No settings found for API Agent node, initializing with defaults"
        );
        setFormData({
          name: '',
          method: 'GET',
          url: '',
          apiKey: '',
          includeApiKey: true,
          bodyParams: ''
        });
      }
    } else if (!isSavingRef.current && selectedNode?.data?.settings) {
      // Only update if settings changed and we're not saving
      const settingsName = selectedNode.data.settings.name || "";
      setFormData((prev) => {
        if (prev.name !== settingsName) {
          console.log(
            "Updating API Agent settings from selectedNode:",
            selectedNode.data.settings
          );
          return selectedNode.data.settings;
        }
        return prev;
      });
    }
  }, [selectedNode?.id, selectedNode?.data?.settings?.name])

  const handleChange = (key: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value
    }))
  }

  const onSave = () => {
    if (!updateFormData) {
      console.error("updateFormData is not available");
      toast.error("Failed to save settings");
      return;
    }
    console.log("Saving API Agent settings:", formData);
    isSavingRef.current = true;
    updateFormData(formData);
    toast.success("Settings saved to database!");
  }

  return (
    <div>
      <h2 className="font-bold">API Agent</h2>
      <p className="text-gray-500 mt-1">
        Call an external API endpoint with your chosen method
      </p>

      {/* Name */}
      <div className="mt-3 space-y-1">
        <Label>Name</Label>
        <Input
          placeholder="API Agent Name"
          value={formData.name || ''}
          onChange={(e) => handleChange('name', e.target.value)}
        />
      </div>

      {/* Method */}
      <div className="mt-3 space-y-1">
        <Label>Request Method</Label>
        <Select
          value={formData.method || 'GET'}
          onValueChange={(value) => handleChange('method', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* URL */}
      <div className="mt-3 space-y-1">
        <Label>API URL</Label>
        <Input
          placeholder="https://api.example.com/data"
          value={formData.url || ''}
          onChange={(e) => handleChange('url', e.target.value)}
        />
      </div>

      {/* API Key */}
      <div className="mt-3 flex justify-between items-center">
        <Label>Include API Key</Label>
        <Switch
          checked={formData.includeApiKey ?? true}
          onCheckedChange={(checked) =>
            handleChange('includeApiKey', checked)
          }
        />
      </div>

      {formData.includeApiKey && (
        <div className="mt-3 space-y-1">
          <Label>API Key</Label>
          <Input
            type="password"
            placeholder="Enter API Key"
            value={formData.apiKey || ''}
            onChange={(e) => handleChange('apiKey', e.target.value)}
          />
        </div>
      )}

      {/* Body Params (Only for POST) */}
      {formData?.method === 'POST' && (
        <div className="mt-3 space-y-1">
          <Label>Body Parameters (JSON)</Label>
          <Textarea
            placeholder='{ "param1": "value1", "param2": "value2" }'
            value={formData.bodyParams || ''}
            onChange={(e) =>
              handleChange('bodyParams', e.target.value)
            }
          />
          <h2 className="text-sm p-1 flex gap-2 items-center">
            Add Body Params <FileJson className="h-3 w-3" />
          </h2>
        </div>
      )}

      <Button className="w-full mt-5" onClick={onSave}>
        Save
      </Button>
    </div>
  )
}

export default ApiAgentSettings
