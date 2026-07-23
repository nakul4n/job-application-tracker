import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { Brand } from "@/components/Brand";

export const metadata: Metadata = {
  title: "A calmer way to run your job search",
  description:
    "Track applications, follow-ups, interviews, recruiter contacts, resume versions, and job-search performance in one private workspace.",
};

const features = [
  ["01", "A pipeline you can trust", "Save roles, update stages, filter the backlog, and preserve the full application history."],
  ["02", "Your next move, visible", "Overdue follow-ups, stale applications, upcoming interviews, and next actions stay in view."],
  ["03", "Interview context", "Keep meeting links, preparation notes, questions, reflections, and results with the application."],
  ["04", "Resume version clarity", "Know which resume went where and compare usage, responses, and interviews without false claims."],
  ["05", "Recruiter memory", "Store contacts privately, connect them to roles, and remember when to reach out again."],
  ["06", "Honest analytics", "Review response, interview, offer, source, and work-mode patterns with transparent definitions."],
];

export default async function LandingPage() {
  const session = await auth();
  return (
    <>
      <header>
        <nav className="publicNav" aria-label="Primary navigation">
          <Brand />
          <div className="navActions">
            <Link className="button ghost" href="#features">
              Features
            </Link>
            {session?.user ? (
              <Link className="button" href="/dashboard">
                Open workspace
              </Link>
            ) : (
              <>
                <Link className="button ghost" href="/sign-in">
                  Sign in
                </Link>
                <Link className="button" href="/sign-up">
                  Create account
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>
      <main id="main-content">
        <section className="hero">
          <div>
            <span className="eyebrow">Your search, organised</span>
            <h1>Keep every opportunity moving.</h1>
            <p>
              A private command centre for applications, recruiter conversations,
              interviews, resume versions, and the next action that matters.
            </p>
            <div className="cluster">
              <Link className="button" href={session?.user ? "/dashboard" : "/sign-up"}>
                {session?.user ? "Open your workspace" : "Start tracking"}
              </Link>
              <Link className="button secondary" href="#features">
                See how it works
              </Link>
            </div>
          </div>
          <div className="heroPanel" aria-label="Product preview">
            <div className="demoBar">
              <span>Thursday, 24 July</span>
              <span>Weekly goal 4 of 6</span>
            </div>
            <div className="demoCard">
              <div className="demoStats">
                <div className="demoStat">
                  <span className="subtle">Active</span>
                  <strong>12</strong>
                </div>
                <div className="demoStat">
                  <span className="subtle">Interviews</span>
                  <strong>3</strong>
                </div>
                <div className="demoStat">
                  <span className="subtle">Due today</span>
                  <strong>2</strong>
                </div>
              </div>
              <div className="miniList">
                <div className="miniRow">
                  <div>
                    <strong>Product Designer</strong>
                    <div className="subtle">Northstar Labs · Prepare case study</div>
                  </div>
                  <span className="badge interview">Final interview</span>
                </div>
                <div className="miniRow">
                  <div>
                    <strong>Frontend Engineer</strong>
                    <div className="subtle">Canopy · Follow up today</div>
                  </div>
                  <span className="badge high">Due</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="featureSection" id="features">
          <div className="sectionIntro">
            <span className="eyebrow">Built for the full search</span>
            <h2>Less tab juggling. More deliberate follow-through.</h2>
            <p>
              Practical tools for the moments where applications usually lose context
              or momentum.
            </p>
          </div>
          <div className="featureGrid">
            {features.map(([number, title, description]) => (
              <article className="feature" key={number}>
                <span className="featureNumber">{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="privacySection">
          <div className="privacyBox">
            <div>
              <span className="eyebrow">Private by design</span>
              <h2>Your job search is personal information.</h2>
              <p>
                Workspace routes require sign-in, and personal records are scoped to
                their owner on the server. Nothing is published as a public profile.
              </p>
            </div>
            <ul>
              <li>No automated scraping or hidden data collection.</li>
              <li>No public sharing of applications or recruiter details.</li>
              <li>No predictive scoring presented as career advice.</li>
              <li>Export your application records to CSV when you need them.</li>
            </ul>
          </div>
        </section>
      </main>
      <footer className="publicFooter">
        <span>Job Application Tracker</span>
        <span>A focused workspace for an organised search.</span>
      </footer>
    </>
  );
}
