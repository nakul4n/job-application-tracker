import { ApplicationStage, Priority, WorkMode } from "@prisma/client";
import { subDays } from "date-fns";
import Link from "next/link";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { stageLabels, stageOptions } from "@/lib/stages";

export const metadata = { title: "Applications" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ApplicationsPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await requireUser();
  const params = await searchParams;
  const search = String(params.search || "").trim();
  const stage = Object.values(ApplicationStage).includes(params.stage as ApplicationStage)
    ? (params.stage as ApplicationStage)
    : undefined;
  const priority = Object.values(Priority).includes(params.priority as Priority)
    ? (params.priority as Priority)
    : undefined;
  const workMode = Object.values(WorkMode).includes(params.workMode as WorkMode)
    ? (params.workMode as WorkMode)
    : undefined;
  const showArchived = params.archived === "true";
  const sort = params.sort === "oldest" ? "asc" : "desc";
  const source = String(params.source || "");
  const recruiterId = String(params.recruiterId || "");
  const resumeId = String(params.resumeId || "");
  const appliedAfter = String(params.appliedAfter || "");
  const hasFollowUp = params.followUp === "true";
  const hasInterview = params.interview === "true";
  const attention = params.attention === "true";

  const [settings, contacts, resumes, sourceRows] = await Promise.all([
    prisma.userSettings.findUnique({ where: { userId: user.id } }),
    prisma.recruiterContact.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.resumeVersion.findMany({
      where: { userId: user.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    prisma.application.findMany({
      where: { userId: user.id, sourcePlatform: { not: null } },
      distinct: ["sourcePlatform"],
      select: { sourcePlatform: true },
      orderBy: { sourcePlatform: "asc" },
    }),
  ]);
  const staleBefore = subDays(new Date(), settings?.noResponseThresholdDays ?? 14);

  const applications = await prisma.application.findMany({
    where: {
      userId: user.id,
      archivedAt: showArchived ? { not: null } : null,
      stage,
      priority,
      workMode,
      sourcePlatform: source || undefined,
      recruiterContactId: recruiterId || undefined,
      resumeVersionId: resumeId || undefined,
      appliedAt: appliedAfter ? { gte: new Date(appliedAfter) } : undefined,
      followUps: hasFollowUp ? { some: { completedAt: null } } : undefined,
      interviews: hasInterview ? { some: { completedAt: null } } : undefined,
      AND: [
        ...(search
          ? [{
              OR: [
                { companyName: { contains: search, mode: "insensitive" as const } },
                { roleTitle: { contains: search, mode: "insensitive" as const } },
                { sourcePlatform: { contains: search, mode: "insensitive" as const } },
                { importantKeywords: { has: search } },
              ],
            }]
          : []),
        ...(attention
          ? [{
              OR: [
                { followUps: { some: { completedAt: null, dueAt: { lt: new Date() } } } },
                { stage: ApplicationStage.APPLIED, appliedAt: { lte: staleBefore } },
              ],
            }]
          : []),
      ],
    },
    include: {
      recruiterContact: { select: { name: true } },
      resumeVersion: { select: { name: true } },
      followUps: { where: { completedAt: null }, orderBy: { dueAt: "asc" }, take: 1 },
    },
    orderBy: { appliedAt: sort },
  });

  return (
    <>
      <div className="pageHeader">
        <div>
          <h1>Applications</h1>
          <p>{applications.length} opportunities in this view.</p>
        </div>
        <div className="cluster">
          <a className="button secondary" href="/api/export/applications">
            Export CSV
          </a>
          <Link className="button" href="/applications/new">
            Add application
          </Link>
        </div>
      </div>

      <form className="filters" aria-label="Application filters">
        <label className="srOnly" htmlFor="search">Search applications</label>
        <input
          className="searchInput"
          id="search"
          name="search"
          defaultValue={search}
          placeholder="Search company, role, source, keyword"
        />
        <select name="stage" defaultValue={stage || ""} aria-label="Filter by stage">
          <option value="">All stages</option>
          {stageOptions.map((value) => (
            <option key={value} value={value}>{stageLabels[value]}</option>
          ))}
        </select>
        <select name="priority" defaultValue={priority || ""} aria-label="Filter by priority">
          <option value="">All priorities</option>
          {Object.values(Priority).map((value) => (
            <option key={value} value={value}>{value.toLowerCase()}</option>
          ))}
        </select>
        <select name="workMode" defaultValue={workMode || ""} aria-label="Filter by work mode">
          <option value="">All work modes</option>
          {Object.values(WorkMode).map((value) => (
            <option key={value} value={value}>{value.toLowerCase()}</option>
          ))}
        </select>
        <select name="source" defaultValue={source} aria-label="Filter by source">
          <option value="">All sources</option>
          {sourceRows.flatMap((row) => row.sourcePlatform ? [<option key={row.sourcePlatform} value={row.sourcePlatform}>{row.sourcePlatform}</option>] : [])}
        </select>
        <select name="recruiterId" defaultValue={recruiterId} aria-label="Filter by recruiter">
          <option value="">All recruiters</option>
          {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
        </select>
        <select name="resumeId" defaultValue={resumeId} aria-label="Filter by resume">
          <option value="">All resumes</option>
          {resumes.map((resume) => <option key={resume.id} value={resume.id}>{resume.name}</option>)}
        </select>
        <label className="field">
          <span className="srOnly">Applied after</span>
          <input className="searchInput" name="appliedAfter" type="date" defaultValue={appliedAfter} aria-label="Applied after" />
        </label>
        <label className="cluster"><input name="followUp" type="checkbox" value="true" defaultChecked={hasFollowUp} /> Pending follow-up</label>
        <label className="cluster"><input name="interview" type="checkbox" value="true" defaultChecked={hasInterview} /> Upcoming interview</label>
        {attention && <input name="attention" type="hidden" value="true" />}
        <button className="button secondary" type="submit">Apply</button>
      </form>

      <div className="cluster" style={{ marginBottom: "1rem" }}>
        <Link className="badge" href="/applications?sort=oldest">Oldest first</Link>
        <Link className="badge" href="/applications?archived=true">Archived</Link>
        {(search || stage || priority || workMode || source || recruiterId || resumeId || appliedAfter || hasFollowUp || hasInterview || showArchived || attention) && (
          <Link className="badge" href="/applications">Clear filters</Link>
        )}
      </div>

      {applications.length ? (
        <div className="panel">
          <div className="desktopTable">
            <table className="dataTable">
              <thead>
                <tr>
                  <th>Opportunity</th>
                  <th>Stage</th>
                  <th>Priority</th>
                  <th>Applied</th>
                  <th>Next action</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((application) => (
                  <tr key={application.id}>
                    <td>
                      <Link href={`/applications/${application.id}`}>
                        <strong>{application.roleTitle}</strong>
                        <span className="subtle" style={{ display: "block" }}>
                          {application.companyName}
                          {application.location ? ` · ${application.location}` : ""}
                        </span>
                      </Link>
                    </td>
                    <td><span className={`badge ${application.stage.toLowerCase()}`}>{stageLabels[application.stage]}</span></td>
                    <td><span className={`badge ${application.priority.toLowerCase()}`}>{application.priority.toLowerCase()}</span></td>
                    <td className="subtle">
                      {application.appliedAt
                        ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(application.appliedAt)
                        : "Not submitted"}
                    </td>
                    <td className="subtle">
                      {application.nextAction || application.followUps[0]?.title || "Add a next action"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mobileCards">
            {applications.map((application) => (
              <Link className="panel" href={`/applications/${application.id}`} key={application.id}>
                <div className="panelHeader">
                  <div>
                    <strong>{application.roleTitle}</strong>
                    <div className="subtle">{application.companyName}</div>
                  </div>
                  <span className="badge">{stageLabels[application.stage]}</span>
                </div>
                <div className="subtle">{application.nextAction || "No next action set"}</div>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="emptyState">
          <div>
            <h2>No applications match this view</h2>
            <p>Adjust your filters or add a new opportunity to the pipeline.</p>
            <Link className="button" href={search || stage ? "/applications" : "/applications/new"}>
              {search || stage ? "Clear filters" : "Add an application"}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
