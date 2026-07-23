import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Create account", robots: { index: false } };

export default async function SignUpPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return (
    <div className="authCard">
      <h1>Create your workspace</h1>
      <p>Start with one application. Build a reliable record as your search grows.</p>
      <AuthForm mode="sign-up" />
      <p className="authSwitch">
        Already have an account? <Link href="/sign-in">Sign in</Link>
      </p>
    </div>
  );
}
