import Link from "next/link";

export default function NotFound() {
  return (
    <main className="authMain" id="main-content">
      <div className="emptyState">
        <div>
          <h1>That record is not available</h1>
          <p>It may have been removed, or you may not have access to it.</p>
          <Link className="button" href="/applications">
            Back to applications
          </Link>
        </div>
      </div>
    </main>
  );
}
