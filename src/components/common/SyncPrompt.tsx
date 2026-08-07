import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CloudUpload, Loader2, Check } from "lucide-react";
import { useUserStore } from "@/stores/useUserStore";
import { hasGuestWorks, migrateLocalWorks, localGuestSeeds, syncFinishedKey } from "@/services/sync";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function SyncPrompt() {
  const user = useUserStore((s) => s.user);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user?.id || user.id === "me") {
      setOpen(false);
      return;
    }
    const finished = localStorage.getItem(syncFinishedKey(user.id));
    if (finished) {
      setOpen(false);
      return;
    }
    // Only show when there is actual guest work on this device to import.
    if (hasGuestWorks()) {
      setCount(localGuestSeeds().length);
      setOpen(true);
    }
  }, [user?.id]);

  const importNow = async () => {
    if (!user?.id) return;
    setBusy(true);
    const result = await migrateLocalWorks(user.id);
    localStorage.setItem(syncFinishedKey(user.id), "1");
    setCount(result.seedsImported);
    setBusy(false);
    setDone(true);
    queryClient.invalidateQueries({ queryKey: ["saved-stories"] });
    window.setTimeout(() => setOpen(false), 1800);
  };

  const skip = () => {
    if (!user?.id) return;
    localStorage.setItem(syncFinishedKey(user.id), "1");
    setOpen(false);
  };

  return (
    <Modal open={open} onClose={skip}>
      <div className="space-y-6 p-8 sm:p-10">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold/10 text-gold">
          <CloudUpload className="h-6 w-6" strokeWidth={1.5} />
        </div>

        {done ? (
          <div className="space-y-2">
            <p className="font-display text-3xl tracking-[-0.03em]">All set</p>
            <p className="text-sm text-secondary leading-relaxed">
              {count > 0
                ? `${count} saved ${count === 1 ? "work" : "works"} are now on your account and will follow you to any device.`
                : "Your saved works are already on your account."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="font-display text-3xl tracking-[-0.03em]">Bring your works with you?</p>
            <p className="text-sm text-secondary leading-relaxed">
              {count > 0
                ? `You have ${count} saved ${count === 1 ? "seed" : "seeds"} on this device. Import them to your account so they survive across devices? They stay private (unpublished) until you share them.`
                : `You have writing on this device from when you were a guest. Import it to your account so it survives across devices?`}
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row">
          {done ? (
            <Button onClick={() => setOpen(false)}>
              <Check className="h-4 w-4" /> Done
            </Button>
          ) : (
            <>
              <Button onClick={importNow} disabled={busy} className="flex-1">
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Importing…
                  </>
                ) : (
                  <>
                    <CloudUpload className="h-4 w-4" /> Import my works
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={skip} disabled={busy} className="flex-1">
                Not now
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
