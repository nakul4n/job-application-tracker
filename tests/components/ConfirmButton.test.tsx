import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ConfirmButton } from "@/components/ConfirmButton";

describe("ConfirmButton", () => {
  it("prevents submission when confirmation is declined", () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <ConfirmButton message="Delete?">Delete</ConfirmButton>
      </form>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Delete" }));
    expect(window.confirm).toHaveBeenCalledWith("Delete?");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
