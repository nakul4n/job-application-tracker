import { ApplicationStage, EmploymentType, Priority, WorkMode } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { applicationSchema, signUpSchema } from "@/lib/validations";

const validApplication = {
  companyName: "Northstar",
  roleTitle: "Product Manager",
  workMode: WorkMode.HYBRID,
  employmentType: EmploymentType.FULL_TIME,
  stage: ApplicationStage.APPLIED,
  priority: Priority.HIGH,
  currency: "usd",
  salaryMin: "100",
  salaryMax: "150",
};

describe("application validation", () => {
  it("normalises currency and accepts valid salary range", () => {
    const result = applicationSchema.parse(validApplication);
    expect(result.currency).toBe("USD");
  });

  it("rejects an inverted salary range", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      salaryMin: "200",
      salaryMax: "150",
    });
    expect(result.success).toBe(false);
  });
});

describe("sign-up validation", () => {
  it("requires a strong minimum password", () => {
    expect(
      signUpSchema.safeParse({
        name: "Taylor",
        email: "taylor@example.com",
        password: "password",
      }).success,
    ).toBe(false);
    expect(
      signUpSchema.safeParse({
        name: "Taylor",
        email: "TAYLOR@example.com",
        password: "Password1",
      }).success,
    ).toBe(true);
  });
});
