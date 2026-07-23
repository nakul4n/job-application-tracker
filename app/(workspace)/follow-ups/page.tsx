import { completeFollowUpAction, rescheduleFollowUpAction } from "@/actions/workspace-actions";
import { FollowUpForm } from "@/components/WorkspaceForms";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Follow-ups" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function FollowUpsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const showCompleted = params.completed === "true";
  const [followUps, applications, contacts] = await Promise.all([
    prisma.followUp.findMany({
      where: { userId: user.id, completedAt: showCompleted ? { not: null } : null },
      include: {
        application: { select: { id: true, companyName: true, roleTitle: true } },
        recruiterContact: { select: { name: true } },
      },
      orderBy: { dueAt: "asc" },
    }),
    prisma.application.findMany({
      where: { userId: user.id, archivedAt: null },
      select: { id: true, companyName: true, roleTitle: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.recruiterContact.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  const now = new Date();
  return (
    <>
      <div className="pageHeader">
        <div><h1>Follow-ups</h1><p>Turn “I should reach out” into a concrete reminder.</p></div>
        <a className="button secondary" href={showCompleted ? "/follow-ups" : "/follow-ups?completed=true"}>
          {showCompleted ? "View pending" : "View completed"}
        </a>
      </div>
      <div className="detailGrid">
        <section className="panel">
          <div className="panelHeader"><h2>{showCompleted ? "Completed" : "Pending reminders"}</h2><span className="subtle">{followUps.length}</span></div>
          {followUps.length ? (
            <ul className="actionList">
              {followUps.map((followUp) => (
                <li className="actionItem" key={followUp.id}>
                  <div>
                    <strong>{followUp.title}</strong>
                    <span className="subtle">
                      {followUp.application ? `${followUp.application.roleTitle} · ${followUp.application.companyName}` : "General"}
                      {followUp.recruiterContact ? ` · ${followUp.recruiterContact.name}` : ""}
                      <br />{followUp.dueAt.toLocaleString()}
                    </span>
                    {followUp.notes && <p className="subtle">{followUp.notes}</p>}
                  </div>
                  {!followUp.completedAt && (
                    <div className="cluster">
                      {followUp.dueAt < now && <span className="badge overdue">Overdue</span>}
                      <form action={completeFollowUpAction}>
                        <input name="id" type="hidden" value={followUp.id} />
                        <button className="button small" type="submit">Complete</button>
                      </form>
                      <form action={rescheduleFollowUpAction} className="cluster">
                        <input name="id" type="hidden" value={followUp.id} />
                        <label className="srOnly" htmlFor={`reschedule-${followUp.id}`}>New due date</label>
                        <input id={`reschedule-${followUp.id}`} name="dueAt" type="datetime-local" required />
                        <button className="button secondary small" type="submit">Reschedule</button>
                      </form>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : <p className="subtle">Nothing in this view.</p>}
        </section>
        <section className="panel">
          <h2>Schedule follow-up</h2>
          <FollowUpForm
            applications={applications}
            contacts={contacts}
            selectedApplicationId={String(params.applicationId || "") || undefined}
          />
        </section>
      </div>
    </>
  );
}
