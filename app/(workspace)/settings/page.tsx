import { deleteAccountAction } from "@/actions/auth-actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { SettingsForm } from "@/components/WorkspaceForms";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = (await prisma.userSettings.findUnique({ where: { userId: user.id } })) || {
    timezone: "UTC",
    preferredCurrency: "USD",
    noResponseThresholdDays: 14,
    weeklyApplicationGoal: 5,
    appearance: "system",
  };
  return (
    <>
      <div className="pageHeader">
        <div><h1>Settings</h1><p>Small defaults that make your workspace more useful.</p></div>
      </div>
      <div className="formPanel">
        <SettingsForm user={user} settings={settings} />
      </div>
      <section className="formPanel dangerZone" style={{ marginTop: "1rem" }}>
        <h2>Delete account</h2>
        <p className="subtle">Permanently removes your account, applications, contacts, interviews, reminders, resumes, notes, and settings. This cannot be undone.</p>
        <form action={deleteAccountAction}>
          <ConfirmButton message="Permanently delete your account and all job-search data?">
            Delete account
          </ConfirmButton>
        </form>
      </section>
    </>
  );
}
