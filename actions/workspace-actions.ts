"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/current-user";
import {
  ownedApplication,
  ownedContact,
  ownedFollowUp,
  ownedNote,
} from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import {
  contactSchema,
  followUpSchema,
  formDataToObject,
  interviewSchema,
  noteSchema,
  resumeSchema,
  settingsSchema,
} from "@/lib/validations";

export type WorkspaceActionState = { error?: string; success?: string };
const idSchema = z.string().min(1).max(128);

export async function createContactAction(
  _state: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const user = await requireUser();
  const parsed = contactSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await prisma.recruiterContact.create({
    data: {
      ...parsed.data,
      email: parsed.data.email || null,
      lastContactAt: parsed.data.lastContactAt ? new Date(parsed.data.lastContactAt) : null,
      nextFollowUpAt: parsed.data.nextFollowUpAt
        ? new Date(parsed.data.nextFollowUpAt)
        : null,
      userId: user.id,
    },
  });
  revalidatePath("/contacts");
  return { success: "Contact added." };
}

export async function createFollowUpAction(
  _state: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const user = await requireUser();
  const parsed = followUpSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  if (parsed.data.applicationId) {
    const owned = await prisma.application.count({
      where: ownedApplication(user.id, parsed.data.applicationId),
    });
    if (!owned) return { error: "Application not found." };
  }
  if (parsed.data.recruiterContactId) {
    const owned = await prisma.recruiterContact.count({
      where: ownedContact(user.id, parsed.data.recruiterContactId),
    });
    if (!owned) return { error: "Contact not found." };
  }

  await prisma.followUp.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      notes: parsed.data.notes || null,
      dueAt: new Date(parsed.data.dueAt),
      applicationId: parsed.data.applicationId || null,
      recruiterContactId: parsed.data.recruiterContactId || null,
    },
  });
  revalidatePath("/follow-ups");
  revalidatePath("/dashboard");
  return { success: "Follow-up scheduled." };
}

export async function completeFollowUpAction(formData: FormData) {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(formData.get("id"));
  if (!parsedId.success) return;
  const id = parsedId.data;
  const followUp = await prisma.followUp.findFirst({
    where: ownedFollowUp(user.id, id),
    select: { id: true, applicationId: true, title: true },
  });
  if (!followUp) return;

  await prisma.$transaction(async (tx) => {
    await tx.followUp.update({ where: { id }, data: { completedAt: new Date() } });
    if (followUp.applicationId) {
      await tx.applicationTimelineEvent.create({
        data: {
          applicationId: followUp.applicationId,
          type: "FOLLOW_UP_SENT",
          title: "Follow-up completed",
          description: followUp.title,
        },
      });
    }
  });
  revalidatePath("/follow-ups");
  revalidatePath("/dashboard");
  if (followUp.applicationId) revalidatePath(`/applications/${followUp.applicationId}`);
}

export async function rescheduleFollowUpAction(formData: FormData) {
  const user = await requireUser();
  const parsed = z.object({
    id: idSchema,
    dueAt: z.string().min(1),
  }).safeParse(formDataToObject(formData));
  if (!parsed.success) return;
  const { id, dueAt } = parsed.data;
  await prisma.followUp.updateMany({
    where: ownedFollowUp(user.id, id),
    data: { dueAt: new Date(dueAt), completedAt: null },
  });
  revalidatePath("/follow-ups");
  revalidatePath("/dashboard");
}

export async function createInterviewAction(
  _state: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const user = await requireUser();
  const parsed = interviewSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const application = await prisma.application.findFirst({
    where: ownedApplication(user.id, parsed.data.applicationId),
    select: { id: true },
  });
  if (!application) return { error: "Application not found." };

  await prisma.$transaction([
    prisma.interview.create({
      data: {
        applicationId: application.id,
        type: parsed.data.type,
        roundName: parsed.data.roundName,
        timezone: parsed.data.timezone,
        interviewerName: parsed.data.interviewerName,
        meetingUrl: parsed.data.meetingUrl || null,
        location: parsed.data.location,
        preparationNotes: parsed.data.preparationNotes,
        questionsAsked: parsed.data.questionsAsked,
        reflections: parsed.data.reflections,
        result: parsed.data.result,
        followUpAt: parsed.data.followUpAt ? new Date(parsed.data.followUpAt) : null,
        completedAt: parsed.data.completed === "on" ? new Date() : null,
        scheduledAt: new Date(parsed.data.scheduledAt),
      },
    }),
    prisma.applicationTimelineEvent.create({
      data: {
        applicationId: application.id,
        type: "INTERVIEW_SCHEDULED",
        title: `${parsed.data.roundName} scheduled`,
        description: new Date(parsed.data.scheduledAt).toLocaleString(),
      },
    }),
  ]);
  revalidatePath("/interviews");
  revalidatePath("/dashboard");
  revalidatePath(`/applications/${application.id}`);
  return { success: "Interview added." };
}

export async function createResumeAction(
  _state: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const user = await requireUser();
  const parsed = resumeSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await prisma.resumeVersion.create({
    data: {
      userId: user.id,
      name: parsed.data.name,
      targetRole: parsed.data.targetRole,
      description: parsed.data.description,
      externalUrl: parsed.data.externalUrl,
      keywords: (parsed.data.keywords || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      isActive: parsed.data.isActive === "on",
    },
  });
  revalidatePath("/resumes");
  return { success: "Resume version added." };
}

export async function createNoteAction(
  _state: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const user = await requireUser();
  const parsed = noteSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  if (parsed.data.applicationId) {
    const owned = await prisma.application.count({
      where: ownedApplication(user.id, parsed.data.applicationId),
    });
    if (!owned) return { error: "Application not found." };
  }
  if (parsed.data.recruiterContactId) {
    const owned = await prisma.recruiterContact.count({
      where: ownedContact(user.id, parsed.data.recruiterContactId),
    });
    if (!owned) return { error: "Contact not found." };
  }
  if (parsed.data.interviewId) {
    const owned = await prisma.interview.count({
      where: { id: parsed.data.interviewId, application: { userId: user.id } },
    });
    if (!owned) return { error: "Interview not found." };
  }

  await prisma.$transaction(async (tx) => {
    await tx.note.create({
      data: {
        userId: user.id,
        title: parsed.data.title,
        content: parsed.data.content,
        applicationId: parsed.data.applicationId,
        recruiterContactId: parsed.data.recruiterContactId,
        interviewId: parsed.data.interviewId,
      },
    });
    if (parsed.data.applicationId) {
      await tx.applicationTimelineEvent.create({
        data: {
          applicationId: parsed.data.applicationId,
          type: "NOTE_ADDED",
          title: parsed.data.title || "Note added",
        },
      });
    }
  });
  if (parsed.data.applicationId) revalidatePath(`/applications/${parsed.data.applicationId}`);
  return { success: "Note added." };
}

export async function deleteNoteAction(formData: FormData) {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(formData.get("id"));
  if (!parsedId.success) return;
  const id = parsedId.data;
  const note = await prisma.note.findFirst({
    where: ownedNote(user.id, id),
    select: { applicationId: true },
  });
  if (!note) return;
  await prisma.note.delete({ where: { id } });
  if (note.applicationId) revalidatePath(`/applications/${note.applicationId}`);
}

export async function updateNoteAction(formData: FormData) {
  const user = await requireUser();
  const parsed = z.object({
    id: idSchema,
    title: z.string().trim().max(160).optional(),
    content: z.string().trim().min(1).max(10_000),
  }).safeParse(formDataToObject(formData));
  if (!parsed.success) return;
  const { id, title, content } = parsed.data;
  const note = await prisma.note.findFirst({
    where: ownedNote(user.id, id),
    select: { applicationId: true },
  });
  if (!note) return;
  await prisma.note.update({
    where: { id },
    data: { title: title || null, content },
  });
  if (note.applicationId) revalidatePath(`/applications/${note.applicationId}`);
}

export async function updateSettingsAction(
  _state: WorkspaceActionState,
  formData: FormData,
): Promise<WorkspaceActionState> {
  const user = await requireUser();
  const parsed = settingsSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await prisma.$transaction([
    prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } }),
    prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        timezone: parsed.data.timezone,
        preferredCurrency: parsed.data.preferredCurrency,
        noResponseThresholdDays: parsed.data.noResponseThresholdDays,
        weeklyApplicationGoal: parsed.data.weeklyApplicationGoal,
      },
      create: {
        userId: user.id,
        timezone: parsed.data.timezone,
        preferredCurrency: parsed.data.preferredCurrency,
        noResponseThresholdDays: parsed.data.noResponseThresholdDays,
        weeklyApplicationGoal: parsed.data.weeklyApplicationGoal,
      },
    }),
  ]);
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: "Settings saved." };
}
