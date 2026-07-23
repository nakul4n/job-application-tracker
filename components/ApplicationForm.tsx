"use client";

import {
  ApplicationStage,
  EmploymentType,
  Priority,
  WorkMode,
  type Application,
} from "@prisma/client";
import Link from "next/link";
import { useActionState } from "react";
import { useForm } from "react-hook-form";
import {
  saveApplicationAction,
  type ApplicationActionState,
} from "@/actions/application-actions";
import { stageLabels, stageOptions } from "@/lib/stages";

type Option = { id: string; name: string };

type Props = {
  application?: Application | null;
  contacts: Option[];
  resumes: Option[];
  preferredCurrency: string;
};

const initialState: ApplicationActionState = {};

function dateInputValue(date?: Date | null) {
  return date ? new Date(date).toISOString().slice(0, 10) : "";
}

export function ApplicationForm({
  application,
  contacts,
  resumes,
  preferredCurrency,
}: Props) {
  const [state, formAction, pending] = useActionState(
    saveApplicationAction,
    initialState,
  );
  const { register } = useForm({
    defaultValues: {
      companyName: application?.companyName || "",
      roleTitle: application?.roleTitle || "",
    },
  });

  const errorFor = (name: string) => state.fieldErrors?.[name]?.[0];

  return (
    <form action={formAction} className="formPanel">
      {application && <input name="id" type="hidden" value={application.id} />}
      <section className="formSection">
        <h2>Opportunity</h2>
        <div className="formGrid">
          <div className="field">
            <label htmlFor="companyName">Company</label>
            <input
              id="companyName"
              {...register("companyName", { required: true })}
              aria-invalid={Boolean(errorFor("companyName"))}
              required
            />
            {errorFor("companyName") && (
              <span className="fieldError">{errorFor("companyName")}</span>
            )}
          </div>
          <div className="field">
            <label htmlFor="roleTitle">Role title</label>
            <input
              id="roleTitle"
              {...register("roleTitle", { required: true })}
              aria-invalid={Boolean(errorFor("roleTitle"))}
              required
            />
            {errorFor("roleTitle") && (
              <span className="fieldError">{errorFor("roleTitle")}</span>
            )}
          </div>
          <div className="field">
            <label htmlFor="location">Location</label>
            <input id="location" name="location" defaultValue={application?.location || ""} />
          </div>
          <div className="field">
            <label htmlFor="workMode">Work mode</label>
            <select id="workMode" name="workMode" defaultValue={application?.workMode || WorkMode.UNSPECIFIED}>
              {Object.values(WorkMode).map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0) + value.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="employmentType">Employment type</label>
            <select
              id="employmentType"
              name="employmentType"
              defaultValue={application?.employmentType || EmploymentType.FULL_TIME}
            >
              {Object.values(EmploymentType).map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ").toLowerCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="priority">Priority</label>
            <select id="priority" name="priority" defaultValue={application?.priority || Priority.MEDIUM}>
              {Object.values(Priority).map((value) => (
                <option key={value} value={value}>
                  {value.charAt(0) + value.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="formSection">
        <h2>Application progress</h2>
        <div className="formGrid">
          <div className="field">
            <label htmlFor="stage">Current stage</label>
            <select id="stage" name="stage" defaultValue={application?.stage || ApplicationStage.SAVED}>
              {stageOptions.map((stage) => (
                <option key={stage} value={stage}>
                  {stageLabels[stage]}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="appliedAt">Application date</label>
            <input
              id="appliedAt"
              name="appliedAt"
              type="date"
              defaultValue={dateInputValue(application?.appliedAt)}
            />
          </div>
          <div className="field fullSpan">
            <label htmlFor="nextAction">Next action</label>
            <input
              id="nextAction"
              name="nextAction"
              defaultValue={application?.nextAction || ""}
              placeholder="Example: Follow up with Maya on Friday"
            />
            <span className="subtle">A concrete next step keeps active applications from going stale.</span>
          </div>
          <div className="field">
            <label htmlFor="recruiterContactId">Recruiter or contact</label>
            <select
              id="recruiterContactId"
              name="recruiterContactId"
              defaultValue={application?.recruiterContactId || ""}
            >
              <option value="">No contact assigned</option>
              {contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="resumeVersionId">Resume version</label>
            <select
              id="resumeVersionId"
              name="resumeVersionId"
              defaultValue={application?.resumeVersionId || ""}
            >
              <option value="">No resume assigned</option>
              {resumes.map((resume) => (
                <option key={resume.id} value={resume.id}>
                  {resume.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="formSection">
        <h2>Source and compensation</h2>
        <div className="formGrid">
          <div className="field">
            <label htmlFor="sourcePlatform">Source platform</label>
            <input
              id="sourcePlatform"
              name="sourcePlatform"
              defaultValue={application?.sourcePlatform || ""}
              placeholder="LinkedIn, company site, referral"
            />
          </div>
          <div className="field">
            <label htmlFor="sourceUrl">Job posting URL</label>
            <input
              id="sourceUrl"
              name="sourceUrl"
              type="url"
              defaultValue={application?.sourceUrl || ""}
            />
            {errorFor("sourceUrl") && <span className="fieldError">{errorFor("sourceUrl")}</span>}
          </div>
          <div className="field">
            <label htmlFor="salaryMin">Minimum salary</label>
            <input
              id="salaryMin"
              name="salaryMin"
              type="number"
              min="0"
              defaultValue={application?.salaryMin || ""}
            />
          </div>
          <div className="field">
            <label htmlFor="salaryMax">Maximum salary</label>
            <input
              id="salaryMax"
              name="salaryMax"
              type="number"
              min="0"
              defaultValue={application?.salaryMax || ""}
            />
            {errorFor("salaryMax") && <span className="fieldError">{errorFor("salaryMax")}</span>}
          </div>
          <div className="field">
            <label htmlFor="currency">Currency</label>
            <input
              id="currency"
              name="currency"
              maxLength={3}
              defaultValue={application?.currency || preferredCurrency}
              required
            />
          </div>
        </div>
      </section>

      <section className="formSection">
        <h2>Preparation context</h2>
        <div className="formGrid">
          <div className="field fullSpan">
            <label htmlFor="importantKeywords">Important keywords</label>
            <input
              id="importantKeywords"
              name="importantKeywords"
              defaultValue={application?.importantKeywords.join(", ") || ""}
              placeholder="TypeScript, accessibility, product analytics"
            />
            <span className="subtle">Separate keywords with commas.</span>
          </div>
          <div className="field fullSpan">
            <label htmlFor="jobDescription">Job description</label>
            <textarea
              id="jobDescription"
              name="jobDescription"
              defaultValue={application?.jobDescription || ""}
              rows={12}
            />
          </div>
          <div className="field fullSpan">
            <label htmlFor="notes">Application notes</label>
            <textarea id="notes" name="notes" defaultValue={application?.notes || ""} />
          </div>
          <div className="field">
            <label htmlFor="rejectionReason">Rejection reason</label>
            <input
              id="rejectionReason"
              name="rejectionReason"
              defaultValue={application?.rejectionReason || ""}
            />
          </div>
          <div className="field">
            <label htmlFor="learningNote">Learning note</label>
            <textarea
              id="learningNote"
              name="learningNote"
              defaultValue={application?.learningNote || ""}
            />
          </div>
        </div>
      </section>

      {state.duplicateId && (
        <div className="notice" role="alert">
          {state.error} <Link href={`/applications/${state.duplicateId}`}>Open matching application</Link>.
          <label className="cluster" style={{ marginTop: "0.7rem" }}>
            <input name="confirmDuplicate" type="checkbox" value="true" />
            Save as a separate application anyway
          </label>
        </div>
      )}
      {state.error && !state.duplicateId && (
        <p className="formError" role="alert">
          {state.error}
        </p>
      )}
      <div className="cluster">
        <button className="button" type="submit" disabled={pending}>
          {pending ? "Saving…" : application ? "Save changes" : "Create application"}
        </button>
        <Link className="button secondary" href={application ? `/applications/${application.id}` : "/applications"}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
