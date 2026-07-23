import Link from "next/link";
import { notFound } from "next/navigation";
import {
  addTimelineEventAction,
  archiveApplicationAction,
  deleteApplicationAction,
  duplicateApplicationAction,
} from "@/actions/application-actions";
import { createNoteAction, deleteNoteAction, updateNoteAction } from "@/actions/workspace-actions";
import { ConfirmButton } from "@/components/ConfirmButton";
import { StageControl } from "@/components/StageControl";
import { requireUser } from "@/lib/current-user";
import { ownedApplication } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { stageLabels } from "@/lib/stages";

type Params = Promise<{ applicationId: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { applicationId } = await params;
  const user = await requireUser();
  const application = await prisma.application.findFirst({
    where: ownedApplication(user.id, applicationId),
    select: { roleTitle: true, companyName: true },
  });
  return {
    title: application ? `${application.roleTitle} at ${application.companyName}` : "Application",
    robots: { index: false },
  };
}

export default async function ApplicationDetailPage({ params }: { params: Params }) {
  const { applicationId } = await params;
  const user = await requireUser();
  const application = await prisma.application.findFirst({
    where: ownedApplication(user.id, applicationId),
    include: {
      recruiterContact: true,
      resumeVersion: true,
      timeline: { orderBy: { occurredAt: "desc" } },
      followUps: { orderBy: { dueAt: "asc" } },
      interviews: { orderBy: { scheduledAt: "asc" } },
      notesList: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!application) notFound();

  return (
    <>
      {application.archivedAt && (
        <div className="notice">This application was archived on {application.archivedAt.toLocaleDateString()}.</div>
      )}
      <div className="pageHeader">
        <div>
          <span className="eyebrow">{application.companyName}</span>
          <h1>{application.roleTitle}</h1>
          <p>
            {[application.location, application.workMode.toLowerCase().replaceAll("_", " ")]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <div className="cluster">
          <Link className="button secondary" href={`/applications/${application.id}/edit`}>
            Edit
          </Link>
          {application.sourceUrl && (
            <a className="button" href={application.sourceUrl} target="_blank" rel="noreferrer">
              Open job post
            </a>
          )}
        </div>
      </div>

      <div className="detailGrid">
        <div>
          <section className="panel" style={{ marginBottom: "1rem" }}>
            <div className="panelHeader">
              <h2>Application snapshot</h2>
              <span className={`badge ${application.stage.toLowerCase()}`}>
                {stageLabels[application.stage]}
              </span>
            </div>
            <StageControl id={application.id} stage={application.stage} />
            <dl className="detailFacts" style={{ marginTop: "1.2rem" }}>
              <div className="fact">
                <dt>Applied</dt>
                <dd>{application.appliedAt?.toLocaleDateString() || "Not submitted"}</dd>
              </div>
              <div className="fact">
                <dt>Priority</dt>
                <dd>{application.priority.toLowerCase()}</dd>
              </div>
              <div className="fact">
                <dt>Source</dt>
                <dd>{application.sourcePlatform || "Not recorded"}</dd>
              </div>
              <div className="fact">
                <dt>Resume</dt>
                <dd>{application.resumeVersion?.name || "Not assigned"}</dd>
              </div>
              <div className="fact">
                <dt>Recruiter</dt>
                <dd>{application.recruiterContact?.name || "Not assigned"}</dd>
              </div>
              <div className="fact">
                <dt>Salary range</dt>
                <dd>
                  {application.salaryMin || application.salaryMax
                    ? `${application.currency} ${application.salaryMin || "—"}–${application.salaryMax || "—"}`
                    : "Not recorded"}
                </dd>
              </div>
            </dl>
            {application.nextAction && (
              <div className="notice" style={{ marginTop: "1rem", marginBottom: 0 }}>
                <strong>Next action:</strong> {application.nextAction}
              </div>
            )}
          </section>

          <section className="panel" style={{ marginBottom: "1rem" }}>
            <div className="panelHeader">
              <h2>Job description</h2>
              {application.importantKeywords.length > 0 && (
                <span className="subtle">{application.importantKeywords.length} keywords</span>
              )}
            </div>
            {application.jobDescription ? (
              <div className="jobDescription">{application.jobDescription}</div>
            ) : (
              <p className="subtle">No job description saved. Add it before the listing disappears.</p>
            )}
            {application.importantKeywords.length > 0 && (
              <ul className="keywordList" aria-label="Important keywords">
                {application.importantKeywords.map((keyword) => (
                  <li className="badge" key={keyword}>{keyword}</li>
                ))}
              </ul>
            )}
          </section>

          <section className="panel">
            <div className="panelHeader">
              <h2>Interviews</h2>
              <Link href={`/interviews?applicationId=${application.id}`}>Schedule interview</Link>
            </div>
            {application.interviews.length ? (
              <ul className="simpleList">
                {application.interviews.map((interview) => (
                  <li className="simpleItem" key={interview.id}>
                    <div>
                      <strong>{interview.roundName}</strong>
                      <span className="subtle">
                        {interview.type} · {interview.scheduledAt.toLocaleString()}
                        {interview.interviewerName ? ` · ${interview.interviewerName}` : ""}
                      </span>
                      {interview.preparationNotes && <p>{interview.preparationNotes}</p>}
                    </div>
                    {interview.meetingUrl && (
                      <a className="button secondary small" href={interview.meetingUrl} target="_blank" rel="noreferrer">
                        Join
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="subtle">No interviews recorded.</p>
            )}
          </section>
        </div>

        <div>
          <section className="panel" style={{ marginBottom: "1rem" }}>
            <div className="panelHeader">
              <h2>Timeline</h2>
              <span className="subtle">{application.timeline.length} events</span>
            </div>
            <ul className="timeline">
              {application.timeline.map((event) => (
                <li className="timelineItem" key={event.id}>
                  <strong>{event.title}</strong>
                  {event.description && <p>{event.description}</p>}
                  <p>{event.occurredAt.toLocaleString()}</p>
                </li>
              ))}
            </ul>
            <form action={addTimelineEventAction} className="formStack">
              <input name="applicationId" type="hidden" value={application.id} />
              <div className="field">
                <label htmlFor="eventTitle">Add timeline event</label>
                <input id="eventTitle" name="title" placeholder="Recruiter called" required />
              </div>
              <div className="field">
                <label htmlFor="eventDescription">Details</label>
                <textarea id="eventDescription" name="description" rows={2} />
              </div>
              <button className="button secondary small" type="submit">Add event</button>
            </form>
          </section>

          <section className="panel" style={{ marginBottom: "1rem" }}>
            <div className="panelHeader">
              <h2>Notes</h2>
              <span className="subtle">{application.notesList.length}</span>
            </div>
            <ul className="simpleList">
              {application.notesList.map((note) => (
                <li className="simpleItem" key={note.id}>
                  <div>
                    <strong>{note.title || "Note"}</strong>
                    <span className="subtle">{note.content}</span>
                    <details style={{ marginTop: "0.6rem" }}>
                      <summary className="subtle">Edit note</summary>
                      <form action={updateNoteAction} className="formStack">
                        <input name="id" type="hidden" value={note.id} />
                        <div className="field">
                          <label htmlFor={`note-title-${note.id}`}>Title</label>
                          <input id={`note-title-${note.id}`} name="title" defaultValue={note.title || ""} />
                        </div>
                        <div className="field">
                          <label htmlFor={`note-content-${note.id}`}>Content</label>
                          <textarea id={`note-content-${note.id}`} name="content" defaultValue={note.content} required />
                        </div>
                        <button className="button secondary small" type="submit">Save note</button>
                      </form>
                    </details>
                  </div>
                  <form action={deleteNoteAction}>
                    <input name="id" type="hidden" value={note.id} />
                    <ConfirmButton className="button ghost small" message="Delete this note?">
                      Delete
                    </ConfirmButton>
                  </form>
                </li>
              ))}
            </ul>
            <form action={async (formData) => { "use server"; await createNoteAction({}, formData); }} className="formStack">
              <input name="applicationId" type="hidden" value={application.id} />
              <div className="field">
                <label htmlFor="noteTitle">Note title</label>
                <input id="noteTitle" name="title" />
              </div>
              <div className="field">
                <label htmlFor="noteContent">Note</label>
                <textarea id="noteContent" name="content" required />
              </div>
              <button className="button secondary small" type="submit">Add note</button>
            </form>
          </section>

          {(application.rejectionReason || application.learningNote) && (
            <section className="panel" style={{ marginBottom: "1rem" }}>
              <h2>Outcome reflection</h2>
              {application.rejectionReason && <p><strong>Reason:</strong> {application.rejectionReason}</p>}
              {application.learningNote && <p className="subtle">{application.learningNote}</p>}
            </section>
          )}

          <section className="panel dangerZone">
            <h2>Application actions</h2>
            <div className="cluster" style={{ marginTop: "1rem" }}>
              <form action={duplicateApplicationAction}>
                <input name="id" type="hidden" value={application.id} />
                <button className="button secondary small" type="submit">Duplicate</button>
              </form>
              {!application.archivedAt && (
                <form action={archiveApplicationAction}>
                  <input name="id" type="hidden" value={application.id} />
                  <ConfirmButton className="button secondary small" message="Archive this application?">
                    Archive
                  </ConfirmButton>
                </form>
              )}
              <form action={deleteApplicationAction}>
                <input name="id" type="hidden" value={application.id} />
                <ConfirmButton message="Permanently delete this application and its timeline?">
                  Delete
                </ConfirmButton>
              </form>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
