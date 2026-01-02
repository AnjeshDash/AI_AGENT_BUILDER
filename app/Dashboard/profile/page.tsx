"use client";
import React, { useContext, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserDetailContext } from "@/app/context/UserDetailContext";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

function ProfilePage() {
  const { userDetail, setUserDetail } = useContext(UserDetailContext);
  const { user: clerkUser } = useUser();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const updateUser = useMutation(api.user.UpdateUser);
  const deleteUser = useMutation(api.user.DeleteUser);

  useEffect(() => {
    if (userDetail) {
      setName(userDetail.name || "");
      setEmail(userDetail.email || "");
    }
  }, [userDetail]);

  const handleSave = async () => {
    if (!userDetail?._id) return toast.error("User ID is required");
    if (!name.trim()) return toast.error("Name is required");

    setLoading(true);
    try {
      const updatedUser = await updateUser({ userId: userDetail._id, name: name.trim() });
      if (updatedUser && setUserDetail) setUserDetail(updatedUser);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error("Failed to update profile: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!userDetail?._id) return toast.error("User ID is required");

    setDeleting(true);
    try {
      await deleteUser({ userId: userDetail._id });
      toast.success("Account deleted successfully");
      window.location.href = "/";
    } catch (error: any) {
      toast.error("Failed to delete account: " + (error.message || "Unknown error"));
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                disabled
              />
              <p className="text-sm text-muted-foreground">
                Email cannot be changed. Contact support if you need to update it.
              </p>
            </div>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>View your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">User ID</span>
              <span className="font-mono text-sm">{userDetail?._id || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Remaining Credits</span>
              <span className="font-bold">{userDetail?.token || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Subscription</span>
              <span>{userDetail?.subscription || "Free"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danger Zone</CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="destructive" 
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Account
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
              All your agents, data sources, and account information will be permanently deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProfilePage;

