"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";

export default function AdminSetupPage() {
  const [userId, setUserId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();
  
  const setUserAsAdmin = useMutation(api.users.setUserAsAdmin);
  const currentUserProfile = useQuery(api.users.getCurrentUserProfile, {});

  const handleSetAsAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      toast.error("Please enter a user ID");
      return;
    }

    setIsLoading(true);
    try {
      await setUserAsAdmin({ userId: userId.trim() });
      toast.success("User set as admin successfully!");
      setUserId("");
    } catch (error) {
      toast.error("Failed to set user as admin");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetCurrentUserAsAdmin = async () => {
    if (!user?.id) {
      toast.error("No current user found");
      return;
    }

    setIsLoading(true);
    try {
      await setUserAsAdmin({ userId: user.id });
      toast.success("Current user set as admin successfully!");
    } catch (error) {
      toast.error("Failed to set current user as admin");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentUserProfile && (
            <Alert>
              <AlertDescription>
                <strong>Current User:</strong> {currentUserProfile.name} ({currentUserProfile.email})
                <br />
                <strong>Role:</strong> {currentUserProfile.role}
                <br />
                <strong>User ID:</strong> {currentUserProfile.id}
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSetAsAdmin} className="space-y-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID to set as admin"
                disabled={isLoading}
              />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Setting..." : "Set User as Admin"}
            </Button>
          </form>

          <div className="border-t pt-4">
            <Button 
              onClick={handleSetCurrentUserAsAdmin} 
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? "Setting..." : "Set Current User as Admin"}
            </Button>
          </div>

          <Alert>
            <AlertDescription>
              <strong>Note:</strong> This is a testing utility. Remove this page in production.
              <br />
              After setting a user as admin, they will be redirected to /admin on next login.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
