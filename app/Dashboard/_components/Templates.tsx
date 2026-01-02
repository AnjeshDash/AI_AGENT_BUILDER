"use client";
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useContext } from "react";
import { UserDetailContext } from "@/app/context/UserDetailContext";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { Bot, MessageSquare, ShoppingCart, Code, FileText } from "lucide-react";

const templates = [
  {
    id: "customer-support",
    name: "Customer Support Agent",
    description: "A helpful customer support agent that can answer questions and resolve issues",
    icon: MessageSquare,
    category: "Support",
  },
  {
    id: "ecommerce-assistant",
    name: "E-commerce Assistant",
    description: "Help customers find products, answer questions, and process orders",
    icon: ShoppingCart,
    category: "E-commerce",
  },
  {
    id: "code-assistant",
    name: "Code Assistant",
    description: "Help developers with coding questions, debugging, and code generation",
    icon: Code,
    category: "Development",
  },
  {
    id: "content-writer",
    name: "Content Writer",
    description: "Generate blog posts, articles, and other written content",
    icon: FileText,
    category: "Content",
  },
  {
    id: "general-assistant",
    name: "General Assistant",
    description: "A versatile AI assistant for various tasks and conversations",
    icon: Bot,
    category: "General",
  },
];

function Templates() {
  const router = useRouter();
  const CreateAgentMutation = useMutation(api.agent.CreateAgent);
  const { userDetail } = useContext(UserDetailContext);
  const [loading, setLoading] = useState<string | null>(null);

  const handleUseTemplate = async (template: typeof templates[0]) => {
    if (!userDetail?._id) {
      toast.error("Please log in to use templates");
      return;
    }

    setLoading(template.id);
    try {
      const agentId = uuidv4();
      await CreateAgentMutation({
        agentId: agentId,
        name: template.name,
        userId: userDetail._id,
      });

      toast.success(`Created agent from ${template.name} template`);
      router.push(`/agent-builder/${agentId}`);
    } catch (error) {
      toast.error("Failed to create agent from template");
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => {
        const Icon = template.icon;
        return (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <Icon className="h-6 w-6 text-primary" />
                <CardTitle>{template.name}</CardTitle>
              </div>
              <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded w-fit">
                {template.category}
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleUseTemplate(template)}
                disabled={loading === template.id}
                className="w-full"
              >
                {loading === template.id ? "Creating..." : "Use Template"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export default Templates;

