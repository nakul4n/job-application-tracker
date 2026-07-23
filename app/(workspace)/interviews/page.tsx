import { InterviewForm } from "@/components/WorkspaceForms";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Interviews" };
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function InterviewsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const [interviews, applications, settings] = await Promise.all([
    prisma.interview.findMany({
      where: { application: { userId: user.id } },
      include: { application: { select: { id: true, companyName: true, roleTitle: true } } },
      orderBy: { scheduledAt: "asc" },
    }),
    prisma.application.findMany({
      where: { userId: user.id, archivedAt: null },
      select: { id: true, companyName: true, roleTitle: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.userSettings.findUnique({ where: { userId: user.id } }),
  ]);
  return (
    <>
      <div className="pageHeader">
        <div><h1>Interviews</h1><p>Keep preparation and logistics attached to the opportunity.</p></div>
      </div>
      <div className="detailGrid">
        <section className="panel">
          <div className="panelHeader"><h2>Interview schedule</h2><span className="subtle">{interviews.length} rounds</span></div>
          {interviews.length ? (
            <ul className="simpleList">
              {interviews.map((interview) => (
                <li className="simpleItem" key={interview.id}>
                  <div>
                    <strong>{interview.roundName}</strong>
                    <span className="subtle">
                      {interview.application.roleTitle} · {interview.application.companyName}
                      <br />{interview.scheduledAt.toLocaleString()} · {interview.timezone}
                    </span>
                    {interview.preparationNotes && <p>{interview.preparationNotes}</p>}
                  </div>
                  {interview.completedAt ? <span className="badge">Completed</span> : <span className="badge interview">Upcoming</span>}
                </li>
              ))}
            </ul>
          ) : <p className="subtle">No interviews recorded. When one arrives, add it here with preparation notes.</p>}
        </section>
        <section className="panel">
          <h2>Add interview</h2>
          <InterviewForm
            applications={applications}
            selectedApplicationId={String(params.applicationId || "") || undefined}
            timezone={settings?.timezone || "UTC"}
          />
        </section>
      </div>
    </>
  );
}
