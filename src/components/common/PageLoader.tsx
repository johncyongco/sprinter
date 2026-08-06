import { motion } from "framer-motion";
import { PenLine } from "lucide-react";

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: [0, 6, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <PenLine className="h-9 w-9 text-gold" strokeWidth={1.25} />
      </motion.div>
      <p className="text-secondary text-sm">Tuning the lamp…</p>
    </div>
  );
}
