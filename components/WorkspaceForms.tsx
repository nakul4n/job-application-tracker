"use client";

import { useActionState } from "react";
import {
  createContactAction,
  createFollowUpAction,
  createInterviewAction,
  createResumeAction,
  updateSettingsAction,
  type WorkspaceActionState,
} from "@/actions/workspace-actions";

const initialState: WorkspaceActionState = {};

function Status({ state }: { state: WorkspaceActionState }) {
  if (state.error) return <p className="formError" role="alert">{state.error}</p>;
  if (state.success) return <p className="formSuccess" role="status">{state.success}</p>;
  return null;
}

export function ContactForm() {
  const [state, action, pending] = useActionState(createContactAction, initialState);
  return (
    <form action={action} className="formStack">
      <div className="formGrid">
        <div className="field"><label htmlFor="contactName">Name</label><input id="contactName" name="name" required /></div>
        <div className="field"><label htmlFor="contactCompany">Company</label><input id="contactCompany" name="company" /></div>
        <div className="field"><label htmlFor="contactRole">Role</label><input id="contactRole" name="role" /></div>
        <div className="field"><label htmlFor="contactEmail">Email</label><input id="contactEmail" name="email" type="email" /></div>
        <div className="field"><label htmlFor="contactPhone">Phone</label><input id="contactPhone" name="phone" type="tel" /></div>
        <div className="field"><label htmlFor="contactLinkedIn">LinkedIn URL</label><input id="contactLinkedIn" name="linkedInUrl" type="url" /></div>
        <div className="field"><label htmlFor="lastContactAt">Last contacted</label><input id="lastContactAt" name="lastContactAt" type="date" /></div>
        <div className="field"><label htmlFor="nextFollowUpAt">Next follow-up</label><input id="nextFollowUpAt" name="nextFollowUpAt" type="datetime-local" /></div>
        <div className="field fullSpan"><label htmlFor="contactNotes">Notes</label><textarea id="contactNotes" name="notes" /></div>
      </div>
      <Status state={state} />
      <button className="button" disabled={pending} type="submit">{pending ? "Adding…" : "Add contact"}</button>
    </form>
  );
}

type ApplicationOption = { id: string; companyName: string; roleTitle: string };
type ContactOption = { id: string; name: string };

export function FollowUpForm({
  applications,
  contacts,
  selectedApplicationId,
}: {
  applications: ApplicationOption[];
  contacts: ContactOption[];
  selectedApplicationId?: string;
}) {
  const [state, action, pending] = useActionState(createFollowUpAction, initialState);
  return (
    <form action={action} className="formStack">
      <div className="field"><label htmlFor="followUpTitle">Reminder</label><input id="followUpTitle" name="title" placeholder="Follow up on application" required /></div>
      <div className="formGrid">
        <div className="field">
          <label htmlFor="followUpApplication">Application</label>
          <select id="followUpApplication" name="applicationId" defaultValue={selectedApplicationId || ""}>
            <option value="">General follow-up</option>
            {applications.map((application) => (
              <option key={application.id} value={application.id}>{application.roleTitle} · {application.companyName}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="followUpContact">Contact</label>
          <select id="followUpContact" name="recruiterContactId">
            <option value="">No contact</option>
            {contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.name}</option>)}
          </select>
        </div>
        <div className="field"><label htmlFor="dueAt">Due date and time</label><input id="dueAt" name="dueAt" type="datetime-local" required /></div>
        <div className="field"><label htmlFor="followUpNotes">Notes</label><input id="followUpNotes" name="notes" /></div>
      </div>
      <Status state={state} />
      <button className="button" disabled={pending} type="submit">{pending ? "Scheduling…" : "Schedule follow-up"}</button>
    </form>
  );
}

export function InterviewForm({
  applications,
  selectedApplicationId,
  timezone,
}: {
  applications: ApplicationOption[];
  selectedApplicationId?: string;
  timezone: string;
}) {
  const [state, action, pending] = useActionState(createInterviewAction, initialState);
  return (
    <form action={action} className="formStack">
      <div className="formGrid">
        <div className="field fullSpan">
          <label htmlFor="interviewApplication">Application</label>
          <select id="interviewApplication" name="applicationId" defaultValue={selectedApplicationId || ""} required>
            <option value="" disabled>Choose an application</option>
            {applications.map((application) => (
              <option key={application.id} value={application.id}>{application.roleTitle} · {application.companyName}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="interviewType">Interview type</label>
          <select id="interviewType" name="type" defaultValue="Technical discussion">
            {["Recruiter screening", "Technical discussion", "Coding round", "System design", "Managerial round", "Behavioural round", "HR discussion", "Take-home assignment", "Other"].map((type) => <option key={type}>{type}</option>)}
          </select>
        </div>
        <div className="field"><label htmlFor="roundName">Round name</label><input id="roundName" name="roundName" placeholder="Second-round interview" required /></div>
        <div className="field"><label htmlFor="scheduledAt">Scheduled date and time</label><input id="scheduledAt" name="scheduledAt" type="datetime-local" required /></div>
        <div className="field"><label htmlFor="timezone">Timezone</label><input id="timezone" name="timezone" defaultValue={timezone} required /></div>
        <div className="field"><label htmlFor="interviewerName">Interviewer</label><input id="interviewerName" name="interviewerName" /></div>
        <div className="field"><label htmlFor="meetingUrl">Meeting URL</label><input id="meetingUrl" name="meetingUrl" type="url" /></div>
        <div className="field"><label htmlFor="interviewLocation">Location</label><input id="interviewLocation" name="location" /></div>
        <div className="field fullSpan"><label htmlFor="preparationNotes">Preparation notes</label><textarea id="preparationNotes" name="preparationNotes" /></div>
        <div className="field fullSpan"><label htmlFor="questionsAsked">Questions asked</label><textarea id="questionsAsked" name="questionsAsked" /></div>
        <div className="field fullSpan"><label htmlFor="reflections">Answers and reflections</label><textarea id="reflections" name="reflections" /></div>
        <div className="field"><label htmlFor="interviewResult">Result</label><input id="interviewResult" name="result" placeholder="Pending, advanced, declined" /></div>
        <div className="field"><label htmlFor="interviewFollowUp">Follow-up date</label><input id="interviewFollowUp" name="followUpAt" type="datetime-local" /></div>
        <label className="cluster"><input name="completed" type="checkbox" /> Interview completed</label>
      </div>
      <Status state={state} />
      <button className="button" disabled={pending} type="submit">{pending ? "Adding…" : "Add interview"}</button>
    </form>
  );
}

export function ResumeForm() {
  const [state, action, pending] = useActionState(createResumeAction, initialState);
  return (
    <form action={action} className="formStack">
      <div className="formGrid">
        <div className="field"><label htmlFor="resumeName">Resume name</label><input id="resumeName" name="name" placeholder="Frontend · July 2026" required /></div>
        <div className="field"><label htmlFor="targetRole">Target role</label><input id="targetRole" name="targetRole" /></div>
        <div className="field fullSpan"><label htmlFor="resumeDescription">Description</label><textarea id="resumeDescription" name="description" /></div>
        <div className="field"><label htmlFor="resumeKeywords">Focus keywords</label><input id="resumeKeywords" name="keywords" placeholder="React, performance, accessibility" /></div>
        <div className="field"><label htmlFor="externalUrl">Document URL</label><input id="externalUrl" name="externalUrl" type="url" /></div>
        <label className="cluster"><input defaultChecked name="isActive" type="checkbox" /> Active version</label>
      </div>
      <Status state={state} />
      <button className="button" disabled={pending} type="submit">{pending ? "Adding…" : "Add resume version"}</button>
    </form>
  );
}

export function SettingsForm({
  user,
  settings,
}: {
  user: { name?: string | null };
  settings: {
    timezone: string;
    preferredCurrency: string;
    noResponseThresholdDays: number;
    weeklyApplicationGoal: number;
  };
}) {
  const [state, action, pending] = useActionState(updateSettingsAction, initialState);
  return (
    <form action={action} className="formStack">
      <div className="formGrid">
        <div className="field"><label htmlFor="settingsName">Name</label><input id="settingsName" name="name" defaultValue={user.name || ""} required /></div>
        <div className="field"><label htmlFor="settingsTimezone">Timezone</label><input id="settingsTimezone" name="timezone" defaultValue={settings.timezone} required /></div>
        <div className="field"><label htmlFor="currency">Preferred currency</label><input id="currency" name="preferredCurrency" maxLength={3} defaultValue={settings.preferredCurrency} required /></div>
        <div className="field"><label htmlFor="threshold">No-response threshold (days)</label><input id="threshold" name="noResponseThresholdDays" type="number" min="3" max="90" defaultValue={settings.noResponseThresholdDays} required /></div>
        <div className="field"><label htmlFor="weeklyGoal">Weekly application goal</label><input id="weeklyGoal" name="weeklyApplicationGoal" type="number" min="1" max="100" defaultValue={settings.weeklyApplicationGoal} required /></div>
      </div>
      <Status state={state} />
      <button className="button" disabled={pending} type="submit">{pending ? "Saving…" : "Save settings"}</button>
    </form>
  );
}
