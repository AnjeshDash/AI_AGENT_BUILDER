"use client";
import React, { useContext, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserDetailContext } from "@/app/context/UserDetailContext";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  Plus,
  Database,
  FileText,
  Globe,
  Trash2,
  Edit,
  Loader2,
  Upload,
} from "lucide-react";
import moment from "moment";

type DataType = "text" | "file" | "api" | "database";

function DataPage() {
  const { userDetail } = useContext(UserDetailContext);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingData, setEditingData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "text" as DataType,
    description: "",
    content: "",
    url: "",
  });

  const createData = useMutation(api.data.CreateData);
  const updateData = useMutation(api.data.UpdateData);
  const deleteData = useMutation(api.data.DeleteData);
  const userData = useQuery(
    api.data.GetUserData,
    userDetail?._id ? { userId: userDetail._id } : "skip"
  );

  useEffect(() => {
    if (editingData) {
      setFormData({
        name: editingData.name || "",
        type: editingData.type || "text",
        description: editingData.description || "",
        content: editingData.content || "",
        url: editingData.url || "",
      });
      setOpenDialog(true);
    }
  }, [editingData]);

  const handleSubmit = async () => {
    if (!userDetail?._id) return toast.error("User ID is required");
    if (!formData.name.trim()) return toast.error("Name is required");

    setLoading(true);
    try {
      const data = {
        name: formData.name,
        description: formData.description,
        content: formData.type === "text" ? formData.content : undefined,
        url: formData.type === "api" ? formData.url : undefined,
      };

      editingData
        ? await updateData({ id: editingData._id, ...data })
        : await createData({ ...data, type: formData.type, userId: userDetail._id });

      toast.success(`Data ${editingData ? "updated" : "created"} successfully!`);
      setOpenDialog(false);
      resetForm();
    } catch (error: any) {
      toast.error("Failed to save data: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this data source?")) return;
    try {
      await deleteData({ id: id as any });
      toast.success("Data deleted successfully!");
    } catch (error: any) {
      toast.error("Failed to delete data: " + (error.message || "Unknown error"));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "text",
      description: "",
      content: "",
      url: "",
    });
    setEditingData(null);
  };

  const handleOpenDialog = () => {
    resetForm();
    setOpenDialog(true);
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, React.ReactNode> = {
      file: <FileText className="h-4 w-4" />,
      api: <Globe className="h-4 w-4" />,
      database: <Database className="h-4 w-4" />,
    };
    return icons[type] || <FileText className="h-4 w-4" />;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Data Management</h1>
          <p className="text-muted-foreground">
            Manage your data sources for AI agents
          </p>
        </div>
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button onClick={handleOpenDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Data Source
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingData ? "Edit Data Source" : "Add New Data Source"}
              </DialogTitle>
              <DialogDescription>
                {editingData
                  ? "Update your data source information"
                  : "Create a new data source for your AI agents"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="My Data Source"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as DataType,
                    })
                  }
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  disabled={!!editingData}
                >
                  <option value="text">Text Content</option>
                  <option value="file">File</option>
                  <option value="api">API Endpoint</option>
                  <option value="database">Database</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Optional description..."
                  rows={3}
                />
              </div>
              {formData.type === "text" && (
                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    placeholder="Enter your text content here..."
                    rows={6}
                  />
                </div>
              )}
              {formData.type === "api" && (
                <div className="space-y-2">
                  <Label htmlFor="url">API URL *</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData({ ...formData, url: e.target.value })
                    }
                    placeholder="https://api.example.com/data"
                  />
                </div>
              )}
              {formData.type === "file" && (
                <div className="space-y-2">
                  <Label>File Upload</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      File upload functionality coming soon
                    </p>
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setOpenDialog(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingData ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Data Sources</CardTitle>
          <CardDescription>
            Manage and organize your data sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          {userData === undefined ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : userData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No data sources yet. Create your first one!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userData.map((data: any) => (
                  <TableRow key={data._id}>
                    <TableCell className="font-medium">{data.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTypeIcon(data.type)}
                        <span className="capitalize">{data.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {data.description || "-"}
                    </TableCell>
                    <TableCell>{formatSize(data.size)}</TableCell>
                    <TableCell>
                      {moment(data._creationTime).fromNow()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingData(data)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(data._id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DataPage;

