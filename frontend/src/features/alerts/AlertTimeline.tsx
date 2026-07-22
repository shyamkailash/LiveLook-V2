import { motion } from "framer-motion";
import { AlertDetails } from "@/features/alerts/AlertDetails";
import type { AlertItem } from "@/types/alert";

export function AlertTimeline({ alerts }: { alerts: AlertItem[] }) {
  return (
    <div className="relative space-y-3 before:absolute before:left-4 before:top-2 before:h-full before:w-px before:bg-border">
      {alerts.map((alert) => (
        <motion.div key={alert.id} layout className="relative pl-10">
          <span className="absolute left-[11px] top-5 h-2.5 w-2.5 rounded-full bg-accent" />
          <AlertDetails alert={alert} />
        </motion.div>
      ))}
    </div>
  );
}
