import { ApplicationForm } from "@/components/ApplicationForm";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "New application" };

export default async function NewApplicationPage() {
  const user = await requireUser();
  const [contacts, resumes, settings] = await Promise.all([
    prisma.recruiterContact.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.resumeVersion.findMany({
      where: { userId: user.id, isActive: true },
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userSettings.findUnique({ where: { userId: user.id } }),
  ]);

  return (
    <>
      <div className="pageHeader">
        <div>
          <h1>Add application</h1>
          <p>Save enough context to make the next decision easier.</p>
        </div>
      </div>
      <ApplicationForm
        contacts={contacts}
        resumes={resumes}
        preferredCurrency={settings?.preferredCurrency || "USD"}
      />
    </>
  );
}
