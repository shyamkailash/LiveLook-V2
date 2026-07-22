import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { Sidebar } from "@/components/navigation/Sidebar";
import { TopNav } from "@/components/navigation/TopNav";

const SIDEBAR_COLLAPSED_WIDTH = 72;
const SIDEBAR_EXPANDED_WIDTH = 260;
type SidebarMode = "collapsed" | "expanded" | "pinned";
const SIDEBAR_MODE_KEY = "livelook-sidebar-mode";

function readSidebarMode(): SidebarMode {
  const stored = window.localStorage.getItem(SIDEBAR_MODE_KEY);
  return stored === "expanded" || stored === "pinned" ? stored : "collapsed";
}

export function DashboardLayout() {
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>(() => readSidebarMode());
  const [tabletLayout, setTabletLayout] = useState(false);
  const expanded = !tabletLayout && sidebarMode !== "collapsed";
  const sidebarWidth = expanded ? SIDEBAR_EXPANDED_WIDTH : SIDEBAR_COLLAPSED_WIDTH;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1024px)");
    const syncTabletLayout = () => {
      setTabletLayout(mediaQuery.matches);
    };

    syncTabletLayout();
    mediaQuery.addEventListener("change", syncTabletLayout);

    return () => mediaQuery.removeEventListener("change", syncTabletLayout);
  }, []);

  useEffect(() => {
    const syncSidebarMode = () => setSidebarMode(readSidebarMode());
    window.addEventListener("storage", syncSidebarMode);
    window.addEventListener("livelook-sidebar-mode-change", syncSidebarMode);

    return () => {
      window.removeEventListener("storage", syncSidebarMode);
      window.removeEventListener("livelook-sidebar-mode-change", syncSidebarMode);
    };
  }, []);

  function updateSidebarMode(mode: SidebarMode) {
    setSidebarMode(mode);
    window.localStorage.setItem(SIDEBAR_MODE_KEY, mode);
    window.dispatchEvent(new Event("livelook-sidebar-mode-change"));
  }

  function toggleSidebar() {
    if (tabletLayout) return;
    updateSidebarMode(expanded ? "collapsed" : "expanded");
  }

  function togglePinned() {
    if (tabletLayout) return;
    updateSidebarMode(sidebarMode === "pinned" ? "expanded" : "pinned");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        expanded={expanded}
        pinned={sidebarMode === "pinned" && !tabletLayout}
        width={sidebarWidth}
        onToggle={toggleSidebar}
        onTogglePinned={togglePinned}
      />
      <div
        className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden transition-[width] duration-200 ease-in-out"
        style={{ width: `calc(100% - ${sidebarWidth}px)` }}
      >
        <TopNav />
        <main className="page-enter min-h-0 flex-1 overflow-y-auto px-4 py-5 transition-[padding] duration-200 ease-in-out md:px-7">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
