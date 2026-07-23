"use server";

import { ApplicationStage } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/current-user";
import { ownedApplication } from "@/lib/ownership";
import { prisma } from "@/lib/prisma";
import { stageLabels, timelineTypeForStage } from "@/lib/stages";
import { applicationSchema, formDataToObject } from "@/lib/validations";

const idSchema = z.string().min(1).max(128);

function dateOrNull(value?: string) {
  return value ? new Date(value) : null;
}

function numberOrNull(value: number | "" | undefined) {
  return value === "" || value === undefined ? null : Number(value);
}

export type ApplicationActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  duplicateId?: string;
};

export async function saveApplicationAction(
  _state: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const user = await requireUser();
  const parsed = applicationSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) {
    return {
      error: "Check the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const id = String(formData.get("id") || "");
  const data = parsed.data;
  if (data.recruiterContactId) {
    const contact = await prisma.recruiterContact.count({
      where: { id: data.recruiterContactId, userId: user.id },
    });
    if (!contact) return { error: "Recruiter contact not found." };
  }
  if (data.resumeVersionId) {
    const resume = await prisma.resumeVersion.count({
      where: { id: data.resumeVersionId, userId: user.id },
    });
    if (!resume) return { error: "Resume version not found." };
  }
  const duplicate = await prisma.application.findFirst({
    where: {
      userId: user.id,
      id: id ? { not: id } : undefined,
      companyName: { equals: data.companyName, mode: "insensitive" },
      roleTitle: { equals: data.roleTitle, mode: "insensitive" },
      archivedAt: null,
    },
    select: { id: true },
  });
  if (duplicate && formData.get("confirmDuplicate") !== "true") {
    return {
      error: "A matching company and role already exists. Review it before adding a duplicate.",
      duplicateId: duplicate.id,
    };
  }

  const values = {
    companyName: data.companyName,
    roleTitle: data.roleTitle,
    location: data.location,
    workMode: data.workMode,
    employmentType: data.employmentType,
    sourcePlatform: data.sourcePlatform,
    sourceUrl: data.sourceUrl,
    appliedAt: dateOrNull(data.appliedAt),
    stage: data.stage,
    salaryMin: numberOrNull(data.salaryMin),
    salaryMax: numberOrNull(data.salaryMax),
    currency: data.currency,
    jobDescription: data.jobDescription || null,
    importantKeywords: (data.importantKeywords || "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    priority: data.priority,
    notes: data.notes || null,
    nextAction: data.nextAction || null,
    rejectionReason: data.rejectionReason || null,
    learningNote: data.learningNote || null,
    recruiterContactId: data.recruiterContactId || null,
    resumeVersionId: data.resumeVersionId || null,
  };

  let applicationId = id;
  if (id) {
    const existing = await prisma.application.findFirst({
      where: ownedApplication(user.id, id),
      select: { stage: true },
    });
    if (!existing) return { error: "Application not found." };

    await prisma.$transaction(async (tx) => {
      await tx.application.update({ where: { id }, data: values });
      if (existing.stage !== data.stage) {
        await tx.applicationTimelineEvent.create({
          data: {
            applicationId: id,
            type: timelineTypeForStage(data.stage),
            title: `Stage changed to ${stageLabels[data.stage]}`,
            description: `Previously ${stageLabels[existing.stage]}.`,
          },
        });
      }
    });
  } else {
    const created = await prisma.application.create({
      data: {
        ...values,
        userId: user.id,
        timeline: {
          create: {
            type: "CREATED",
            title: data.stage === "SAVED" ? "Application saved" : "Application created",
            description: `${data.roleTitle} at ${data.companyName}`,
          },
        },
      },
    });
    applicationId = created.id;
  }

  revalidatePath("/applications");
  revalidatePath("/dashboard");
  redirect(`/applications/${applicationId}`);
}

export async function updateStageAction(formData: FormData) {
  const user = await requireUser();
  const parsed = z.object({
    id: idSchema,
    stage: z.nativeEnum(ApplicationStage),
  }).safeParse(formDataToObject(formData));
  if (!parsed.success) return;
  const { id, stage } = parsed.data;

  const application = await prisma.application.findFirst({
    where: ownedApplication(user.id, id),
    select: { stage: true },
  });
  if (!application || application.stage === stage) return;

  await prisma.$transaction([
    prisma.application.update({ where: { id }, data: { stage } }),
    prisma.applicationTimelineEvent.create({
      data: {
        applicationId: id,
        type: timelineTypeForStage(stage),
        title: `Stage changed to ${stageLabels[stage]}`,
        description: `Previously ${stageLabels[application.stage]}.`,
      },
    }),
  ]);
  revalidatePath(`/applications/${id}`);
  revalidatePath("/applications");
  revalidatePath("/dashboard");
}

export async function addTimelineEventAction(formData: FormData) {
  const user = await requireUser();
  const parsed = z.object({
    applicationId: idSchema,
    title: z.string().trim().min(1).max(160),
    description: z.string().trim().max(2_000).optional(),
  }).safeParse(formDataToObject(formData));
  if (!parsed.success) return;
  const { applicationId, title, description } = parsed.data;

  const application = await prisma.application.findFirst({
    where: ownedApplication(user.id, applicationId),
    select: { id: true },
  });
  if (!application) return;

  await prisma.applicationTimelineEvent.create({
    data: { applicationId, type: "CUSTOM", title, description: description || null },
  });
  revalidatePath(`/applications/${applicationId}`);
}

export async function archiveApplicationAction(formData: FormData) {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(formData.get("id"));
  if (!parsedId.success) return;
  const id = parsedId.data;
  await prisma.application.updateMany({
    where: ownedApplication(user.id, id),
    data: { archivedAt: new Date() },
  });
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  redirect("/applications");
}

export async function deleteApplicationAction(formData: FormData) {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(formData.get("id"));
  if (!parsedId.success) return;
  const id = parsedId.data;
  await prisma.application.deleteMany({ where: ownedApplication(user.id, id) });
  revalidatePath("/applications");
  revalidatePath("/dashboard");
  redirect("/applications");
}

export async function duplicateApplicationAction(formData: FormData) {
  const user = await requireUser();
  const parsedId = idSchema.safeParse(formData.get("id"));
  if (!parsedId.success) return;
  const id = parsedId.data;
  const original = await prisma.application.findFirst({
    where: ownedApplication(user.id, id),
  });
  if (!original) return;
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...copy } = original;
  void _id;
  void _createdAt;
  void _updatedAt;
  const duplicated = await prisma.application.create({
    data: {
      ...copy,
      stage: "SAVED",
      appliedAt: null,
      archivedAt: null,
      nextAction: "Review and submit application",
      timeline: {
        create: {
          type: "CREATED",
          title: "Application duplicated",
          description: `Copied from ${original.roleTitle} at ${original.companyName}.`,
        },
      },
    },
  });
  redirect(`/applications/${duplicated.id}/edit`);
}
