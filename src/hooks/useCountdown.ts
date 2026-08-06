import { useEffect, useState } from "react";

export interface Countdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function diff(target: string): Countdown {
  const now = new Date();
  const end = new Date(target);
  const ms = Math.max(0, end.getTime() - now.getTime());
  const expired = ms === 0;
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  return { days, hours, minutes, seconds, expired };
}

export function useCountdown(target: string): Countdown {
  const [countdown, setCountdown] = useState(() => diff(target));

  useEffect(() => {
    setCountdown(diff(target));
    const timer = setInterval(() => setCountdown(diff(target)), 1000);
    return () => clearInterval(timer);
  }, [target]);

  return countdown;
}
