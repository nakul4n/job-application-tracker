import {
  ApplicationStage,
  EmploymentType,
  PrismaClient,
  Priority,
  TimelineEventType,
  WorkMode,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@example.com";
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: {
      name: "Demo Job Seeker",
      email,
      passwordHash: await hash("DemoPassword1", 12),
      settings: {
        create: {
          timezone: "Asia/Kolkata",
          preferredCurrency: "INR",
          noResponseThresholdDays: 14,
          weeklyApplicationGoal: 6,
        },
      },
    },
  });

  const [productResume, engineeringResume] = await Promise.all([
    prisma.resumeVersion.create({
      data: {
        userId: user.id,
        name: "Product-focused resume",
        targetRole: "Product Manager",
        description: "Emphasises discovery, delivery, and measurable outcomes.",
        keywords: ["product strategy", "experimentation", "analytics"],
      },
    }),
    prisma.resumeVersion.create({
      data: {
        userId: user.id,
        name: "Frontend resume",
        targetRole: "Frontend Engineer",
        description: "Emphasises accessible interfaces and application performance.",
        keywords: ["React", "TypeScript", "accessibility"],
      },
    }),
  ]);

  const contact = await prisma.recruiterContact.create({
    data: {
      userId: user.id,
      name: "Maya Rao",
      company: "Northstar Labs",
      role: "Senior Recruiter",
      email: "maya.recruiter@example.com",
      notes: "Prefers concise follow-ups by email.",
      lastContactAt: new Date(Date.now() - 3 * 86_400_000),
    },
  });

  const examples = [
    {
      companyName: "Northstar Labs",
      roleTitle: "Product Manager",
      stage: ApplicationStage.FINAL_INTERVIEW,
      workMode: WorkMode.HYBRID,
      priority: Priority.HIGH,
      sourcePlatform: "Referral",
      resumeVersionId: productResume.id,
      recruiterContactId: contact.id,
      nextAction: "Refine metrics case study",
      daysAgo: 18,
    },
    {
      companyName: "Canopy Systems",
      roleTitle: "Frontend Engineer",
      stage: ApplicationStage.TECHNICAL_INTERVIEW,
      workMode: WorkMode.REMOTE,
      priority: Priority.HIGH,
      sourcePlatform: "Company site",
      resumeVersionId: engineeringResume.id,
      recruiterContactId: null,
      nextAction: "Prepare system design examples",
      daysAgo: 10,
    },
    {
      companyName: "Harbour Works",
      roleTitle: "Senior Product Analyst",
      stage: ApplicationStage.APPLIED,
      workMode: WorkMode.ONSITE,
      priority: Priority.MEDIUM,
      sourcePlatform: "LinkedIn",
      resumeVersionId: productResume.id,
      recruiterContactId: null,
      nextAction: "Follow up after 14 days",
      daysAgo: 8,
    },
    {
      companyName: "Fieldnote",
      roleTitle: "Product Operations Manager",
      stage: ApplicationStage.REJECTED,
      workMode: WorkMode.REMOTE,
      priority: Priority.LOW,
      sourcePlatform: "Wellfound",
      resumeVersionId: productResume.id,
      recruiterContactId: null,
      nextAction: null,
      daysAgo: 30,
    },
  ];

  for (const item of examples) {
    const appliedAt = new Date(Date.now() - item.daysAgo * 86_400_000);
    await prisma.application.create({
      data: {
        userId: user.id,
        companyName: item.companyName,
        roleTitle: item.roleTitle,
        stage: item.stage,
        workMode: item.workMode,
        employmentType: EmploymentType.FULL_TIME,
        priority: item.priority,
        sourcePlatform: item.sourcePlatform,
        appliedAt,
        currency: "INR",
        importantKeywords: ["collaboration", "customer focus"],
        jobDescription:
          "Build thoughtful products with a cross-functional team. Communicate clearly, use evidence, and improve the customer experience.",
        resumeVersionId: item.resumeVersionId,
        recruiterContactId: item.recruiterContactId,
        nextAction: item.nextAction,
        rejectionReason: item.stage === ApplicationStage.REJECTED ? "Role scope changed" : null,
        learningNote:
          item.stage === ApplicationStage.REJECTED
            ? "Ask about decision ownership earlier in the process."
            : null,
        timeline: {
          create: [
            {
              type: TimelineEventType.CREATED,
              title: "Application created",
              occurredAt: appliedAt,
            },
            ...(item.stage !== ApplicationStage.APPLIED
              ? [
                  {
                    type: TimelineEventType.STAGE_CHANGED,
                    title: `Stage changed to ${item.stage.toLowerCase().replaceAll("_", " ")}`,
                    occurredAt: new Date(appliedAt.getTime() + 3 * 86_400_000),
                  },
                ]
              : []),
          ],
        },
      },
    });
  }

  const northstar = await prisma.application.findFirstOrThrow({
    where: { userId: user.id, companyName: "Northstar Labs" },
  });
  await prisma.followUp.create({
    data: {
      userId: user.id,
      applicationId: northstar.id,
      recruiterContactId: contact.id,
      title: "Send final-round availability",
      dueAt: new Date(Date.now() + 86_400_000),
      notes: "Include two afternoon options.",
    },
  });
  await prisma.interview.create({
    data: {
      applicationId: northstar.id,
      type: "Final interview",
      roundName: "Leadership conversation",
      scheduledAt: new Date(Date.now() + 3 * 86_400_000),
      timezone: "Asia/Kolkata",
      interviewerName: "Hiring panel",
      preparationNotes: "Prepare a concise product trade-off story and questions about the first 90 days.",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
