import Link from "next/link";
import { Brand } from "@/components/Brand";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="authShell">
      <aside className="authAside">
        <Brand />
        <blockquote>
          Keep the opportunity, the context, and the next move together.
        </blockquote>
        <Link href="/">Back to home</Link>
      </aside>
      <main className="authMain" id="main-content">
        {children}
      </main>
    </div>
  );
}
