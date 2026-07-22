import {
  Activity,
  Cpu,
  FileText,
  Gauge,
  MonitorDot,
  Settings,
  User,
  ListTree,
} from "lucide-react";
import { routes } from "@/constants/routes";

export const sidebarItems = [
  { label: "Dashboard", href: routes.dashboard, icon: Gauge },
  { label: "Live Monitoring", href: routes.monitoring, icon: MonitorDot },
  { label: "Devices", href: routes.devices, icon: Cpu },
  { label: "Monitoring Sessions", href: routes.sessions, icon: Activity },
  { label: "Events", href: routes.events, icon: ListTree },
  { label: "Reports", href: routes.reports, icon: FileText },
  { label: "Settings", href: routes.settings, icon: Settings },
  { label: "Profile", href: routes.profile, icon: User },
] as const;
