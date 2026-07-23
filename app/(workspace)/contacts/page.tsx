import { ContactForm } from "@/components/WorkspaceForms";
import { requireUser } from "@/lib/current-user";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Contacts" };

export default async function ContactsPage() {
  const user = await requireUser();
  const contacts = await prisma.recruiterContact.findMany({
    where: { userId: user.id },
    include: {
      _count: { select: { applications: true } },
      applications: { select: { id: true, companyName: true, roleTitle: true }, take: 3 },
    },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <>
      <div className="pageHeader">
        <div><h1>Contacts</h1><p>Recruiters and hiring contacts stay private to your account.</p></div>
      </div>
      <div className="detailGrid">
        <section className="panel">
          <div className="panelHeader"><h2>Your contacts</h2><span className="subtle">{contacts.length} total</span></div>
          {contacts.length ? (
            <ul className="simpleList">
              {contacts.map((contact) => (
                <li className="simpleItem" key={contact.id}>
                  <div>
                    <strong>{contact.name}</strong>
                    <span className="subtle">
                      {[contact.role, contact.company].filter(Boolean).join(" · ") || "Contact details"}
                      <br />{contact._count.applications} related applications
                      {contact.lastContactAt ? ` · Last contact ${contact.lastContactAt.toLocaleDateString()}` : ""}
                    </span>
                    {contact.applications.length > 0 && (
                      <div className="keywordList">
                        {contact.applications.map((application) => (
                          <a className="badge" href={`/applications/${application.id}`} key={application.id}>
                            {application.roleTitle}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    {contact.email && <a className="badge" href={`mailto:${contact.email}`}>Email</a>}
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className="subtle">No contacts yet. Add one when a recruiter or hiring manager reaches out.</p>}
        </section>
        <section className="panel"><h2>Add contact</h2><ContactForm /></section>
      </div>
    </>
  );
}
