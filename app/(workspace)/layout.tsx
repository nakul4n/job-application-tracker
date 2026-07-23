import type { Metadata } from "next";
import Link from "next/link";
import { logoutAction } from "@/actions/auth-actions";
import { Brand } from "@/components/Brand";
import { requireUser } from "@/lib/current-user";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

const navigation = [
  ["/dashboard", "Overview"],
  ["/applications", "Applications"],
  ["/follow-ups", "Follow-ups"],
  ["/interviews", "Interviews"],
  ["/contacts", "Contacts"],
  ["/resumes", "Resumes"],
  ["/analytics", "Analytics"],
  ["/settings", "Settings"],
];

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  return (
    <div className="workspace">
      <aside className="sidebar">
        <Brand href="/dashboard" />
        <nav className="sidebarNav" aria-label="Workspace navigation">
          {navigation.map(([href, label]) => (
            <Link href={href} key={href}>
              {label}
            </Link>
          ))}
        </nav>
        <div className="sidebarFooter">
          <span>
            Signed in as
            <br />
            <strong>{user.email}</strong>
          </span>
          <form action={logoutAction}>
            <button className="button secondary small" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="workspaceMain" id="main-content">
        <div className="workspaceTopbar">
          <div className="mobileBrand">
            <Brand href="/dashboard" />
          </div>
          <span className="subtle">
            {new Intl.DateTimeFormat("en", {
              weekday: "long",
              day: "numeric",
              month: "long",
            }).format(new Date())}
          </span>
          <Link className="button small" href="/applications/new">
            Add application
          </Link>
        </div>
        {children}
      </main>
    </div>
  );
}
