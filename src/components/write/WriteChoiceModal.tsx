import { useNavigate } from "react-router-dom";
import { Sprout, Feather, ArrowUpRight } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface WriteChoiceModalProps {
  open: boolean;
  onClose: () => void;
}

export function WriteChoiceModal({ open, onClose }: WriteChoiceModalProps) {
  const navigate = useNavigate();

  const go = (to: string) => {
    onClose();
    navigate(to);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      className="max-w-lg"
      labelledBy="write-choice-title"
    >
      <div className="p-8 sm:p-10 space-y-6">
        <div className="space-y-2">
          <p className="uppercase tracking-[0.25em] text-xs text-secondary font-semibold">
            What would you like to write?
          </p>
          <h2
            id="write-choice-title"
            className="font-display text-3xl tracking-[-0.03em] leading-tight"
          >
            Begin a branch
          </h2>
        </div>

        <button
          type="button"
          onClick={() => go("/write")}
          className="group w-full rounded-[26px] border border-gold/25 bg-gradient-to-br from-gold/15 via-card to-accent/10 p-6 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/30 bg-card text-gold">
              <Sprout className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <ArrowUpRight
              className="h-5 w-5 text-secondary transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={1.75}
            />
          </div>
          <p className="mt-4 font-display text-xl font-semibold tracking-[-0.02em]">
            Start a Story Seed
          </p>
          <p className="mt-1.5 text-sm text-secondary leading-relaxed">
            Choose genre, emotion, and theme — your opening becomes the seed someone
            else can carry forward.
          </p>
        </button>

        <button
          type="button"
          onClick={() => go("/write/anything")}
          className="group w-full rounded-[26px] border border-accent/25 bg-gradient-to-br from-accent/15 via-card to-gold/5 p-6 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-card"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-accent/30 bg-card text-accent">
              <Feather className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <ArrowUpRight
              className="h-5 w-5 text-secondary transition-transform duration-300 group-hover:translate-x-1"
              strokeWidth={1.75}
            />
          </div>
          <p className="mt-4 font-display text-xl font-semibold tracking-[-0.02em]">
            Write Anything
          </p>
          <p className="mt-1.5 text-sm text-secondary leading-relaxed">
            A title and free rein — save it straight to the library as your own piece.
          </p>
        </button>
      </div>
    </Modal>
  );
}
