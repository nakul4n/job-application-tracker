import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AuthForm } from "@/components/AuthForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function SignInPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return (
    <div className="authCard">
      <h1>Welcome back</h1>
      <p>Sign in to continue your private job-search workspace.</p>
      <AuthForm mode="sign-in" />
      <p className="authSwitch">
        New here? <Link href="/sign-up">Create an account</Link>
      </p>
    </div>
  );
}
