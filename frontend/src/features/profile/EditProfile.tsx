import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";

export function EditProfile() {
  const { user } = useAuth();
  return (
    <Card>
      <CardHeader><h2 className="text-lg font-semibold">Edit Profile</h2></CardHeader>
      <CardContent className="space-y-3">
        <Input defaultValue={user?.displayName ?? ""} />
        <Input defaultValue={user?.email ?? ""} />
        <Input defaultValue="Teacher" />
        <Button onClick={() => toast.success("Profile Updated")}>Save Profile</Button>
      </CardContent>
    </Card>
  );
}
