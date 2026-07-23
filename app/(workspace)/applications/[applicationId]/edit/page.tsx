import { notFound } from "next/navigation";
import { ApplicationForm } from "@/components/ApplicationForm";
import { requireUser } from "@/lib/current-user";
import { ownedApplication } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ applicationId: string }>;

export const metadata = { title: "Edit application" };

export default async function EditApplicationPage({ params }: { params: Params }) {
  const { applicationId } = await params;
  const user = await requireUser();
  const [application, contacts, resumes, settings] = await Promise.all([
    prisma.application.findFirst({ where: ownedApplication(user.id, applicationId) }),
    prisma.recruiterContact.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.resumeVersion.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.userSettings.findUnique({ where: { userId: user.id } }),
  ]);
  if (!application) notFound();

  return (
    <>
      <div className="pageHeader">
        <div>
          <h1>Edit application</h1>
          <p>{application.roleTitle} at {application.companyName}</p>
        </div>
      </div>
      <ApplicationForm
        application={application}
        contacts={contacts}
        resumes={resumes}
        preferredCurrency={settings?.preferredCurrency || application.currency}
      />
    </>
  );
}
