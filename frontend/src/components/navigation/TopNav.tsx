import { Bell, CheckCheck, Search, Settings, Trash2, UserRound, Wifi } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { useWebSocket } from "@/hooks/useWebSocket";
import { getAlerts } from "@/services/alerts.service";
import { formatClock } from "@/utils/date";

export function TopNav() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const teacherName = user?.displayName?.trim() || "Teacher";
  const avatarInitial = teacherName.charAt(0).toUpperCase();
  const { connected } = useWebSocket();
  const [clock, setClock] = useState(formatClock());
  const [search, setSearch] = useState("");
  const [panelOpen, setPanelOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<"all" | "critical" | "warning" | "information">("all");
  const [readIds, setReadIds] = useState<string[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const { data: alerts = [] } = useQuery({ queryKey: ["topnav-alerts"], queryFn: getAlerts });

  useEffect(() => {
    const timer = window.setInterval(() => setClock(formatClock()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const suggestions = useMemo(() => {
    const entries = [
      { label: "Live Monitoring", meta: "Open device grid", href: routes.monitoring },
      { label: "Devices", meta: "Windows agent fleet", href: routes.devices },
      { label: "Monitoring Sessions", meta: "Create or start a session", href: routes.sessions },
      { label: "Events", meta: "Alerts, warnings, logs", href: routes.events },
      { label: "Reports", meta: "Export session evidence", href: routes.reports },
    ];
    if (!search.trim()) return [];
    return entries.filter((entry) => `${entry.label} ${entry.meta}`.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  const visibleAlerts = alerts
    .filter((alert) => !hiddenIds.includes(alert.id))
    .filter((alert) => {
      if (notificationFilter === "all") return true;
      if (notificationFilter === "information") return alert.level === "low";
      if (notificationFilter === "warning") return alert.level === "high" || alert.level === "medium";
      return alert.level === notificationFilter;
    });
  const unread = visibleAlerts.filter((alert) => !readIds.includes(alert.id));

  return (
    <header className="sticky top-0 z-20 flex min-h-[72px] items-center justify-between gap-4 border-b border-divider bg-background/85 px-4 py-3 backdrop-blur-xl transition-[padding] duration-200 ease-in-out md:px-7">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative min-w-[220px] flex-1 xl:max-w-[620px]">
          <label className="flex h-12 w-full items-center gap-3 rounded-2xl border border-divider bg-card px-4 text-muted shadow-inset">
            <Search className="h-5 w-5" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full bg-transparent text-[16px] text-text outline-none placeholder:text-muted"
              placeholder="Search devices, sessions, events, reports"
              aria-label="Global search"
            />
          </label>
          {suggestions.length ? (
            <div className="absolute left-0 top-14 z-50 w-full rounded-2xl border border-border bg-card p-2 shadow-pro backdrop-blur-xl">
              {suggestions.map((item) => (
                <button
                  key={item.href}
                  className="block w-full rounded-md px-3 py-2 text-left hover:bg-hover"
                  onClick={() => {
                    setSearch("");
                    navigate(item.href);
                  }}
                >
                  <span className="block text-sm font-medium text-text">{item.label}</span>
                  <span className="text-xs text-muted">{item.meta}</span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <Badge tone={connected ? "success" : "danger"} className="hidden xl:inline-flex">
          <Wifi className="mr-1.5 h-3.5 w-3.5" />
          {connected ? "Connected" : "Reconnecting"}
        </Badge>
        <div
          className="relative"
          onMouseEnter={() => setPanelOpen(true)}
          onMouseLeave={() => setPanelOpen(false)}
        >
          <Button
            variant="secondary"
            size="icon"
            aria-label="Malpractice alerts"
            onClick={() => setPanelOpen(true)}
            onFocus={() => setPanelOpen(true)}
          >
            <Bell className="h-4 w-4" />
          </Button>
          {unread.length ? (
            <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full border border-border bg-surface px-1 text-[11px] font-semibold text-text">
              {unread.length}
            </span>
          ) : null}
          {panelOpen ? (
            <div className="absolute right-0 top-14 z-50 w-[420px] rounded-2xl border border-border bg-card shadow-pro backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-divider p-4">
                <div>
                  <p className="font-semibold text-text">Malpractice Alerts</p>
                  <p className="text-xs text-muted">{unread.length} unread policy events</p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setReadIds(alerts.map((alert) => alert.id))}>
                  <CheckCheck className="h-4 w-4" />
                  Mark all read
                </Button>
              </div>
              <div className="flex gap-2 border-b border-divider p-3">
                {(["all", "critical", "warning", "information"] as const).map((filter) => (
                  <button
                    key={filter}
                    className={notificationFilter === filter ? "rounded-full bg-selection px-3 py-1.5 text-[13px] font-semibold text-text" : "rounded-full px-3 py-1.5 text-[13px] text-muted hover:bg-hover"}
                    onClick={() => setNotificationFilter(filter)}
                  >
                    {filter}
                  </button>
                ))}
                <button
                  className="ml-auto rounded-full px-3 py-1.5 text-[13px] text-muted hover:bg-hover"
                  onClick={() => setHiddenIds(alerts.map((alert) => alert.id))}
                >
                  <Trash2 className="inline h-3.5 w-3.5" /> Clear
                </button>
              </div>
              <div className="max-h-[420px] overflow-auto p-2">
                {visibleAlerts.slice(0, 7).map((alert) => (
                  <button
                    key={alert.id}
                    className="block w-full rounded-xl px-3 py-3 text-left hover:bg-hover"
                    onClick={() => {
                      setReadIds((ids) => [...new Set([...ids, alert.id])]);
                      setPanelOpen(false);
                      navigate(routes.monitoring);
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-text">{alert.student}</span>
                      <Badge tone={alert.level === "critical" ? "danger" : alert.level === "high" ? "warning" : "neutral"}>
                        {alert.level}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted">{alert.reason}</p>
                  </button>
                ))}
                {!visibleAlerts.length ? <p className="p-5 text-center text-[15px] text-muted">No illegal or malpractice alerts in this filter.</p> : null}
              </div>
            </div>
          ) : null}
        </div>
        <span className="w-28 text-[15px] text-muted">{clock}</span>
        {user ? (
          <div className="relative">
            <button
              className="grid h-12 w-12 place-items-center rounded-2xl border border-divider bg-card shadow-pro"
              onClick={() => setProfileOpen((open) => !open)}
              aria-label="Profile menu"
            >
              <Avatar initials={avatarInitial} src={user.photoURL} alt={teacherName} className="h-9 w-9" />
            </button>
            {profileOpen ? (
              <div className="absolute right-0 top-14 z-50 w-56 rounded-2xl border border-border bg-card p-2 shadow-pro backdrop-blur-xl">
                <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[15px] hover:bg-hover" onClick={() => navigate(routes.profile)}>
                  <UserRound className="h-4 w-4" /> Profile
                </button>
                <button className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[15px] hover:bg-hover" onClick={() => navigate(routes.settings)}>
                  <Settings className="h-4 w-4" /> Settings
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
