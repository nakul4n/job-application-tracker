import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stageLabels } from "@/lib/stages";

function csvCell(value: unknown) {
  const text = value == null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const applications = await prisma.application.findMany({
    where: { userId: session.user.id },
    include: {
      recruiterContact: { select: { name: true, email: true } },
      resumeVersion: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const headers = [
    "Company", "Role", "Stage", "Applied date", "Location", "Work mode", "Employment type",
    "Source", "Source URL", "Priority", "Salary minimum", "Salary maximum", "Currency",
    "Resume version", "Recruiter name", "Recruiter email", "Next action", "Keywords",
    "Archived", "Created", "Updated",
  ];
  const rows = applications.map((item) => [
    item.companyName, item.roleTitle, stageLabels[item.stage],
    item.appliedAt?.toISOString().slice(0, 10), item.location, item.workMode,
    item.employmentType, item.sourcePlatform, item.sourceUrl, item.priority,
    item.salaryMin, item.salaryMax, item.currency, item.resumeVersion?.name,
    item.recruiterContact?.name, item.recruiterContact?.email, item.nextAction,
    item.importantKeywords.join("; "), Boolean(item.archivedAt),
    item.createdAt.toISOString(), item.updatedAt.toISOString(),
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="job-applications-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
