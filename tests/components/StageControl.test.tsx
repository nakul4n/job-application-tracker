import { ApplicationStage } from "@prisma/client";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/actions/application-actions", () => ({
  updateStageAction: vi.fn(),
}));

import { StageControl } from "@/components/StageControl";

describe("StageControl", () => {
  it("labels the stage control and shows the current stage", () => {
    render(<StageControl id="application-1" stage={ApplicationStage.ASSESSMENT} />);
    expect(screen.getByLabelText("Update stage")).toHaveValue("ASSESSMENT");
    expect(screen.getByRole("button", { name: "Update stage" })).toBeEnabled();
  });
});
