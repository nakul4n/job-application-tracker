"use client";

export default function WorkspaceError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="emptyState" role="alert">
      <div>
        <h1>We could not load your workspace</h1>
        <p>Your data has not been changed. Try loading this page again.</p>
        <button className="button" onClick={reset} type="button">
          Try again
        </button>
      </div>
    </div>
  );
}
