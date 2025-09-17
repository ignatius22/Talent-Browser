import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeAll } from "vitest";
import TalentList from "../app/components/TalentList";

const baseTalent = {
  id: "t_001",
  name: "Amara Okoye",
  location: "Lagos, NG",
  timezone: "Africa/Lagos",
  primarySkill: "Frontend",
  skills: ["React", "Next.js", "TypeScript", "Tailwind"],
  yearsExperience: 4,
  availabilityHrsPerWeek: 30,
  rateUsdPerHour: 20,
  rating: 4.6,
  verified: true,
  lastActive: "2025-09-12T10:15:00Z",
  bio: "Frontend engineer focused on DX and performance.",
  tags: ["web", "ux", "component-libraries"],
};

beforeAll(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([baseTalent]),
    })
  ) as any;
});

describe("TalentList", () => {
  it("shows validation errors when form is submitted empty", async () => {
    render(<TalentList />);
    const button = await screen.findByRole("button", { name: /apply/i });
    fireEvent.click(button);

    expect(await screen.findByText(/Name is required/i)).toBeInTheDocument();
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it("renders a fetched talent", async () => {
    render(<TalentList />);
    expect(await screen.findByText("Amara Okoye")).toBeInTheDocument();
    const details = await screen.findByText(/4 yrs • Frontend/i);
    expect(details).toBeInTheDocument();
  });

  it("sorts talents by years of experience (ascending)", async () => {
    const mockTalents = [
      {
        ...baseTalent,
        id: "t_001",
        name: "Amara Okoye",
        displayName: "Amara Okoye",
        yearsExperience: 4,
      },
      {
        ...baseTalent,
        id: "t_002",
        name: "Bola Adeyemi",
        displayName: "Bola Adeyemi",
        primarySkill: "Backend",
        yearsExperience: 7,
      },
      {
        ...baseTalent,
        id: "t_003",
        name: "Chinedu Umeh",
        displayName: "Chinedu Umeh",
        yearsExperience: 2,
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTalents),
    });

    render(<TalentList />);
    const items = await screen.findAllByRole("listitem");

    // Ascending sort → least experienced (2 yrs) first
    expect(items[0]).toHaveTextContent("Chinedu Umeh");
    expect(items[0]).toHaveTextContent("2 yrs");
  });

  it("filters talents by skill", async () => {
    const mockTalents = [
      {
        ...baseTalent,
        id: "t_001",
        name: "Amara Okoye",
        primarySkill: "Frontend",
      },
      {
        ...baseTalent,
        id: "t_002",
        name: "Bola Adeyemi",
        primarySkill: "Backend",
      },
    ];

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTalents),
    });

    render(<TalentList />);
    await screen.findByText("Amara Okoye");

    // Pick the 2nd select (the filter dropdown, not the form select)
    const selects = screen.getAllByRole("combobox");
    fireEvent.change(selects[1], { target: { value: "Backend" } });

    const backendOnly = await screen.findAllByRole("listitem");
    expect(backendOnly).toHaveLength(1);
    expect(backendOnly[0]).toHaveTextContent("Bola Adeyemi");
  });
});
