import { Check, Pencil, Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type RuleCategory =
  | "Allowed Apps"
  | "Blocked Apps"
  | "Website Rules"
  | "USB Rules"
  | "Browser Rules"
  | "Monitoring Rules";

interface PolicyRule {
  id: string;
  name: string;
  detail: string;
  category: RuleCategory;
  enabled: boolean;
}

const categories: RuleCategory[] = [
  "Allowed Apps",
  "Blocked Apps",
  "Website Rules",
  "USB Rules",
  "Browser Rules",
  "Monitoring Rules",
];

const defaultRules: PolicyRule[] = [
  { id: "rule-1", name: "VS Code", detail: "Development", category: "Allowed Apps", enabled: true },
  { id: "rule-2", name: "PyCharm", detail: "Development", category: "Allowed Apps", enabled: true },
  { id: "rule-3", name: "Media Streaming", detail: "Block entertainment sites", category: "Blocked Apps", enabled: true },
  { id: "rule-4", name: "Private Browsing", detail: "Detect incognito windows", category: "Browser Rules", enabled: true },
  { id: "rule-5", name: "USB Write Access", detail: "Disable external copy", category: "USB Rules", enabled: true },
  { id: "rule-6", name: "Idle Timeout", detail: "Flag after 10 minutes", category: "Monitoring Rules", enabled: true },
];

export function Policies() {
  const [rules, setRules] = useState(defaultRules);
  const [activeCategory, setActiveCategory] = useState<RuleCategory>("Allowed Apps");
  const [draft, setDraft] = useState({ name: "", detail: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const visibleRules = useMemo(
    () => rules.filter((rule) => rule.category === activeCategory),
    [activeCategory, rules],
  );

  function addOrUpdateRule() {
    if (!draft.name.trim()) {
      toast.error("Rule name is required");
      return;
    }

    if (editingId) {
      setRules((current) =>
        current.map((rule) =>
          rule.id === editingId ? { ...rule, name: draft.name, detail: draft.detail } : rule,
        ),
      );
      toast.success("Policy Updated");
    } else {
      setRules((current) => [
        ...current,
        {
          id: `rule-${Date.now()}`,
          name: draft.name,
          detail: draft.detail || "Custom policy rule",
          category: activeCategory,
          enabled: true,
        },
      ]);
      toast.success("Rule added");
    }

    setDraft({ name: "", detail: "" });
    setEditingId(null);
  }

  function editRule(rule: PolicyRule) {
    setEditingId(rule.id);
    setDraft({ name: rule.name, detail: rule.detail });
  }

  function cancelEdit() {
    setEditingId(null);
    setDraft({ name: "", detail: "" });
    toast.info("Policy edit cancelled");
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[22px] font-bold">Policy Rule Builder</h2>
            <p className="mt-1 text-[15px] text-muted">Create and customize monitoring policies.</p>
          </div>
          <Button variant="secondary" onClick={() => {
            setRules(defaultRules);
            setDraft({ name: "", detail: "" });
            setEditingId(null);
            toast.success("Policy reset to default");
          }}>
            <RotateCcw className="h-4 w-4" />Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-[220px_1fr_320px] gap-5">
        <nav className="space-y-2 border-r border-divider pr-4">
          {categories.map((category) => (
            <button
              key={category}
              className={category === activeCategory ? "w-full rounded-2xl bg-selection px-4 py-3 text-left text-[15px] font-bold text-text" : "w-full rounded-2xl px-4 py-3 text-left text-[15px] font-medium text-muted hover:bg-hover"}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </nav>
        <section className="space-y-3">
          {visibleRules.map((rule) => (
            <div key={rule.id} className="grid grid-cols-[1fr_120px_auto] items-center gap-3 rounded-2xl border border-divider bg-surface/70 px-4 py-3">
              <div>
                <p className="text-[16px] font-bold text-text">{rule.name}</p>
                <p className="text-[14px] text-muted">{rule.detail}</p>
              </div>
              <button
                className={rule.enabled ? "rounded-full border border-border bg-surface px-3 py-1.5 text-[14px] font-semibold text-muted" : "rounded-full border border-border bg-surface px-3 py-1.5 text-[14px] font-semibold text-muted"}
                onClick={() => {
                  setRules((current) => current.map((item) => item.id === rule.id ? { ...item, enabled: !item.enabled } : item));
                  toast.success(`${rule.name} ${rule.enabled ? "disabled" : "enabled"}`);
                }}
              >
                {rule.enabled ? <Check className="mr-1 inline h-3.5 w-3.5" /> : <X className="mr-1 inline h-3.5 w-3.5" />}
                {rule.enabled ? "Enabled" : "Disabled"}
              </button>
              <div className="flex gap-2">
                <Button variant="secondary" size="icon" onClick={() => editRule(rule)} aria-label={`Edit ${rule.name}`}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setRules((current) => current.filter((item) => item.id !== rule.id));
                    toast.warning(`${rule.name} deleted`);
                  }}
                  aria-label={`Delete ${rule.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {!visibleRules.length ? <p className="rounded-2xl border border-divider bg-surface p-5 text-[15px] text-muted">No rules in this category.</p> : null}
        </section>
        <aside className="space-y-4 rounded-2xl border border-divider bg-surface/70 p-4">
          <div>
            <h3 className="text-[18px] font-bold">{editingId ? "Edit Rule" : "Add Rule"}</h3>
            <p className="text-[14px] text-muted">{activeCategory}</p>
          </div>
          <Input placeholder="Rule name" value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
          <Input placeholder="Description or rule detail" value={draft.detail} onChange={(event) => setDraft((current) => ({ ...current, detail: event.target.value }))} />
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={cancelEdit}>Cancel</Button>
            <Button onClick={addOrUpdateRule}>
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Save" : "Add"}
            </Button>
          </div>
          <Button className="w-full" onClick={() => toast.success("Policy Updated")}>
            <Save className="h-4 w-4" />Save Policy
          </Button>
        </aside>
      </CardContent>
    </Card>
  );
}
