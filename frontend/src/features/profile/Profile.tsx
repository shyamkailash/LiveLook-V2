import { SectionHeader } from "@/components/common/SectionHeader";
import { Avatar } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { EditProfile } from "@/features/profile/EditProfile";
import { useAuth } from "@/hooks/useAuth";

export function Profile() {
  const { user } = useAuth();
  const email = user?.email ?? "teacher";
  const name = user?.displayName ?? email;
  const avatarInitial = email.charAt(0).toUpperCase();

  return (
    <div>
      <SectionHeader eyebrow="Profile" title="Faculty Profile" />
      <div className="grid grid-cols-[360px_1fr] gap-5">
        <Card>
          <CardContent className="text-center">
            <Avatar initials={avatarInitial} className="mx-auto h-20 w-20 text-2xl" />
            <h2 className="mt-5 text-xl font-semibold">{name}</h2>
            <p className="mt-1 text-sm text-muted">{email}</p>
            <p className="mt-4 rounded-lg bg-secondary px-4 py-3 text-sm text-muted">Teacher</p>
          </CardContent>
        </Card>
        <EditProfile />
      </div>
    </div>
  );
}
