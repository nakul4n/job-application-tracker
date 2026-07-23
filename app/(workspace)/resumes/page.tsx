import { ResumeForm } from "@/components/WorkspaceForms";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";
import { hasResponse, reachedInterview } from "@/lib/stages";

export const metadata = { title: "Resume versions" };

export default async function ResumesPage() {
  const user = await requireUser();
  const resumes = await prisma.resumeVersion.findMany({
    where: { userId: user.id },
    include: { applications: { select: { stage: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <div className="pageHeader">
        <div><h1>Resume versions</h1><p>Remember which version was used without treating correlation as proof.</p></div>
      </div>
      <div className="notice">Response and interview counts describe past applications. They do not prove that one resume caused an outcome.</div>
      <div className="detailGrid">
        <section className="panel">
          <div className="panelHeader"><h2>Your versions</h2><span className="subtle">{resumes.length}</span></div>
          {resumes.length ? (
            <ul className="simpleList">
              {resumes.map((resume) => (
                <li className="simpleItem" key={resume.id}>
                  <div>
                    <strong>{resume.name}</strong>
                    <span className="subtle">
                      {resume.targetRole || "General resume"} · {resume.applications.length} applications ·{" "}
                      {resume.applications.filter((item) => hasResponse(item.stage)).length} responses ·{" "}
                      {resume.applications.filter((item) => reachedInterview(item.stage)).length} interviews
                    </span>
                    {resume.keywords.length > 0 && <div className="keywordList">{resume.keywords.map((keyword) => <span className="badge" key={keyword}>{keyword}</span>)}</div>}
                  </div>
                  {resume.externalUrl && <a className="button secondary small" href={resume.externalUrl} target="_blank" rel="noreferrer">Open</a>}
                </li>
              ))}
            </ul>
          ) : <p className="subtle">Add the first resume version you use in applications.</p>}
        </section>
        <section className="panel"><h2>Add resume version</h2><ResumeForm /></section>
      </div>
    </>
  );
}
