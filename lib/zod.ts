import { z } from "zod";

export const biscuitBuddyFormSchema = z.object({
  total_money: z
    .number({
      required_error: "Total money is required",
    })
    .min(0, { message: "Total money must be at least 0" }),
  total_team_members: z
    .number({
      required_error: "Total team members is required",
    })
    .min(1, { message: "At least 1 team member is required" })
    .max(50, { message: "Team members cannot exceed 50" }),
    date: z.date(),
    team_members: z
    .array(
      z.object({
        name: z
          .string({
            required_error: "Team member name is required",
          })
          .min(1, { message: "Team member name cannot be empty" }),
        advancedPayment: z
          .union([z.string(), z.number()])
          .refine((val) => {
            if (typeof val === 'string') return !isNaN(parseFloat(val));
            return val >= 0;
          }, { message: "Advance payment must be a valid number" })
          .transform((val) => (typeof val === 'string' ? parseFloat(val) : val))
      })
    )
    .min(1, { message: "At least 1 team member is required" })
    .max(50, { message: "Team members cannot exceed 50" }),
});
