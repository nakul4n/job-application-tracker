import { ApplicationStage, EmploymentType, Priority, WorkMode } from "@prisma/client";
import { z } from "zod";

const optionalUrl = z
  .union([z.url("Enter a valid URL"), z.literal("")])
  .optional()
  .transform((value) => value || undefined);

const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: z.email("Enter a valid email").transform((value) => value.toLowerCase()),
  password: z
    .string()
    .min(8, "Use at least 8 characters")
    .regex(/[A-Z]/, "Include an uppercase letter")
    .regex(/[0-9]/, "Include a number"),
});

export const applicationSchema = z
  .object({
    companyName: z.string().trim().min(2, "Company is required").max(120),
    roleTitle: z.string().trim().min(2, "Role is required").max(160),
    location: optionalText,
    workMode: z.nativeEnum(WorkMode),
    employmentType: z.nativeEnum(EmploymentType),
    sourcePlatform: optionalText,
    sourceUrl: optionalUrl,
    appliedAt: z.string().optional(),
    stage: z.nativeEnum(ApplicationStage),
    salaryMin: z.coerce.number().int().positive().optional().or(z.literal("")),
    salaryMax: z.coerce.number().int().positive().optional().or(z.literal("")),
    currency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
    jobDescription: z.string().max(40_000).optional(),
    importantKeywords: z.string().optional(),
    priority: z.nativeEnum(Priority),
    notes: z.string().max(10_000).optional(),
    nextAction: z.string().max(240).optional(),
    rejectionReason: z.string().max(240).optional(),
    learningNote: z.string().max(2_000).optional(),
    recruiterContactId: optionalText,
    resumeVersionId: optionalText,
  })
  .refine(
    (value) =>
      !value.salaryMin ||
      !value.salaryMax ||
      Number(value.salaryMin) <= Number(value.salaryMax),
    { message: "Maximum salary must be greater than minimum", path: ["salaryMax"] },
  );

export const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: optionalText,
  role: optionalText,
  email: z.union([z.email(), z.literal("")]).optional(),
  phone: optionalText,
  linkedInUrl: optionalUrl,
  notes: z.string().max(4_000).optional(),
  lastContactAt: z.string().optional(),
  nextFollowUpAt: z.string().optional(),
});

export const followUpSchema = z.object({
  title: z.string().trim().min(2).max(160),
  applicationId: optionalText,
  recruiterContactId: optionalText,
  notes: z.string().max(2_000).optional(),
  dueAt: z.string().min(1, "Choose a due date"),
});

export const interviewSchema = z.object({
  applicationId: z.string().min(1),
  type: z.string().trim().min(2).max(80),
  roundName: z.string().trim().min(2).max(120),
  scheduledAt: z.string().min(1),
  timezone: z.string().min(1),
  interviewerName: optionalText,
  meetingUrl: optionalUrl,
  location: optionalText,
  preparationNotes: z.string().max(10_000).optional(),
  questionsAsked: z.string().max(10_000).optional(),
  reflections: z.string().max(10_000).optional(),
  result: optionalText,
  followUpAt: z.string().optional(),
  completed: z.string().optional(),
});

export const resumeSchema = z.object({
  name: z.string().trim().min(2).max(120),
  targetRole: optionalText,
  description: z.string().max(2_000).optional(),
  keywords: z.string().optional(),
  externalUrl: optionalUrl,
  isActive: z.string().optional(),
});

export const noteSchema = z.object({
  applicationId: optionalText,
  recruiterContactId: optionalText,
  interviewId: optionalText,
  title: optionalText,
  content: z.string().trim().min(1).max(10_000),
});

export const settingsSchema = z.object({
  name: z.string().trim().min(2).max(80),
  timezone: z.string().min(1).max(80),
  preferredCurrency: z.string().trim().length(3).transform((value) => value.toUpperCase()),
  noResponseThresholdDays: z.coerce.number().int().min(3).max(90),
  weeklyApplicationGoal: z.coerce.number().int().min(1).max(100),
});

export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
