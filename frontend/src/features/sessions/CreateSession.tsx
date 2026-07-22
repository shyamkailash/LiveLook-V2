import { Card, CardHeader } from "@/components/ui/card";
import { SessionWizard } from "@/features/sessions/SessionWizard";

export function CreateSession() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Create Monitoring Session</h2>
          <p className="mt-1 text-sm text-muted">Configure applications, rules, duration, department, and lab before going live.</p>
        </CardHeader>
      </Card>
      <SessionWizard />
    </div>
  );
}
