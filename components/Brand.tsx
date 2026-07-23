import Link from "next/link";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link className="brand" href={href} aria-label="Job Application Tracker home">
      <span className="brandMark" aria-hidden="true">
        JT
      </span>
      <span>Job Tracker</span>
    </Link>
  );
}
