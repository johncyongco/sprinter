import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export function ErrorPage() {
  const error = useRouteError();

  const message = isRouteErrorResponse(error)
    ? `${error.status} — ${error.statusText}`
    : "Something went quiet.";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6 text-center">
      <p className="font-display text-6xl tracking-[-0.05em]">{message}</p>
      <p className="text-secondary max-w-md leading-relaxed">
        An error interrupted the page. Your drafts are safe — they live on this device.
      </p>
      <button
        type="button"
        onClick={() => window.location.assign("/")}
        className="rounded-full bg-primary text-white px-6 py-3 text-sm font-semibold transition hover:scale-[1.02]"
      >
        Return to the library
      </button>
    </div>
  );
}
