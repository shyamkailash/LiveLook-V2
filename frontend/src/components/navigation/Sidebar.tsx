import { LogOut, Pin, PinOff } from "lucide-react";
import { motion } from "framer-motion";
import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { sidebarItems } from "@/constants/sidebar";
import { routes } from "@/constants/routes";
import { useAuth } from "@/hooks/useAuth";
import { getReadableAuthError } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/utils/helpers";

type SidebarProps = {
  expanded: boolean;
  pinned: boolean;
  width: number;
  onToggle: () => void;
  onTogglePinned: () => void;
};

export function Sidebar({ expanded, pinned, width, onToggle, onTogglePinned }: SidebarProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      toast.success("Signed out successfully");
      navigate(routes.login);
    } catch (error) {
      toast.error(getReadableAuthError(error));
    }
  }

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="sticky left-0 top-0 z-30 flex h-screen shrink-0 flex-col overflow-hidden border-r border-border bg-[var(--color-sidebar)] px-3 py-4 will-change-[width]"
    >
      <div className="mb-7 flex h-12 items-center gap-3 px-2">
        <button
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg outline-none transition duration-200 hover:rotate-[10deg] hover:scale-105 focus-visible:ring-2 focus-visible:ring-focus"
          onClick={onToggle}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          <img src="/logo.svg" alt="AI SYSTEM MONITOR" className="h-10 w-10 rounded-lg" />
        </button>
        {expanded ? (
          <>
            <span className="min-w-0 flex-1 whitespace-nowrap text-[16px] font-bold tracking-tight">AI SYSTEM MONITOR</span>
            <button
              className="grid h-9 w-9 place-items-center rounded-lg text-muted transition hover:bg-hover hover:text-text focus-visible:ring-2 focus-visible:ring-focus"
              onClick={onTogglePinned}
              aria-label={pinned ? "Unpin sidebar" : "Pin sidebar"}
            >
              {pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
            </button>
          </>
        ) : null}
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {sidebarItems.map((item) => (
          <Tooltip key={item.label} label={item.label}>
            <NavLink
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "group relative flex h-12 items-center gap-3 rounded-xl px-3 text-[16px] font-semibold text-text transition hover:bg-hover",
                  isActive && "bg-selection text-text before:absolute before:left-0 before:top-2 before:h-7 before:w-1 before:rounded-full before:bg-accent",
                )
              }
            >
              <item.icon className="h-[22px] w-[22px] shrink-0 transition group-hover:scale-105" />
              {expanded ? <span className="whitespace-nowrap">{item.label}</span> : null}
            </NavLink>
          </Tooltip>
        ))}
      </nav>
      <Button
        variant="ghost"
        className="h-12 w-full justify-start rounded-xl px-3 text-[16px] font-semibold text-text hover:bg-hover"
        onClick={handleLogout}
      >
        <LogOut className="h-6 w-6 shrink-0" />
        {expanded ? <span>Logout</span> : null}
      </Button>
    </motion.aside>
  );
}
