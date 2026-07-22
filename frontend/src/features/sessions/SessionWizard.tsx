import { Copy, QrCode } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { allowedApplications, blockedApplications, sessionTypes } from "@/constants/monitoring";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSessionStore } from "@/store/sessionStore";

export function SessionWizard() {
  const { wizardStep, setWizardStep } = useSessionStore();
  const [joinCode, setJoinCode] = useState("");
  const [started, setStarted] = useState(false);
  const generatedCode = useMemo(() => String(Math.floor(100000 + Math.random() * 900000)), []);

  async function copyJoinCode() {
    const code = joinCode || generatedCode;
    try {
      await navigator.clipboard?.writeText(code);
      toast.success(`Join code ${code} copied`);
    } catch {
      toast.info(`Join code: ${code}`);
    }
  }

  function generateSession() {
    const code = joinCode || generatedCode;
    setJoinCode(code);
    setStarted(true);
    toast.success(`Session Started: ${code}`);
  }

  return (
    <Card>
      <CardContent className="space-y-5">
        <div className="flex gap-2">
          {[1, 2, 3].map((step) => (
            <button key={step} className={wizardStep === step ? "h-2 flex-1 rounded-full bg-focus" : "h-2 flex-1 rounded-full bg-border"} onClick={() => setWizardStep(step)} />
          ))}
        </div>
        {wizardStep === 1 ? (
          <div className="grid grid-cols-2 gap-3">
            <Input placeholder="Session name" />
            <Input placeholder="Department" />
            <Input placeholder="Lab" />
            <select className="h-11 rounded-lg border border-border bg-secondary px-3 text-sm text-text outline-none focus:border-focus">
              {sessionTypes.map((type) => <option key={type}>{type}</option>)}
            </select>
          </div>
        ) : null}
        {wizardStep === 2 ? (
          <div className="grid grid-cols-2 gap-4">
            <Checklist title="Allowed Applications" items={allowedApplications} />
            <Checklist title="Blocked Applications" items={blockedApplications} />
          </div>
        ) : null}
        {wizardStep === 3 ? (
          <div className="grid grid-cols-[1fr_260px] gap-5">
            <div className="grid grid-cols-3 gap-3">
              <Input placeholder="Session duration minutes" defaultValue="120" />
              <Input placeholder="AI sensitivity" defaultValue="82" />
              <Input placeholder="Screenshot frequency seconds" defaultValue="45" />
            </div>
            <div className="rounded-lg border border-border bg-surface p-4 text-center shadow-inset">
              <p className="text-xs uppercase tracking-[0.18em] text-muted">Join Code</p>
              <p className="mt-2 text-4xl font-semibold tracking-[0.2em] text-text">{joinCode || generatedCode}</p>
              <div className="mt-4 grid h-24 place-items-center rounded-lg border border-dashed border-border text-muted">
                <QrCode className="h-10 w-10" />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-muted">
                <span>Connected 0</span>
                <span>Waiting 30</span>
              </div>
            </div>
          </div>
        ) : null}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setWizardStep(Math.max(1, wizardStep - 1))}>Back</Button>
          {wizardStep === 3 ? (
            <>
              <Button variant="secondary" onClick={copyJoinCode}><Copy className="h-4 w-4" />Copy Code</Button>
              <Button onClick={generateSession}>{started ? "Start Monitoring" : "Generate Session"}</Button>
            </>
          ) : (
            <Button onClick={() => setWizardStep(Math.min(3, wizardStep + 1))}>Next</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Checklist({ title, items }: { title: string; items: readonly string[] }) {
  return (
    <div>
      <h3 className="mb-3 font-semibold">{title}</h3>
      <div className="space-y-2">
        {items.map((item) => (
          <label key={item} className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-muted">
            <input type="checkbox" defaultChecked className="h-4 w-4 [accent-color:var(--color-accent)]" />
            {item}
          </label>
        ))}
      </div>
    </div>
  );
}
