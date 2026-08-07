import { ProfileSettings } from "./ProfileSettings";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-12">
      <div className="space-y-4">
        <p className="uppercase tracking-[0.25em] text-xs text-gold font-semibold">Settings</p>
        <h1 className="font-display text-[3.5rem] leading-[0.95] tracking-[-0.05em] max-sm:text-[2.6rem]">
          Tending the room
        </h1>
        <p className="text-secondary leading-relaxed max-w-xl">
          Your room, your pace. Sprinter keeps its settings as quiet as its stories.
        </p>
      </div>

      <ProfileSettings />
    </div>
  );
}
