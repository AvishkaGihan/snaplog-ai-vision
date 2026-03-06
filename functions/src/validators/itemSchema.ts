import { z } from "zod";

export const itemAnalysisSchema = z.object({
  title: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  color: z.string().min(1).max(100),
  condition: z.enum(["Excellent", "Good", "Fair", "Poor"]),
});

export type ItemAnalysisResult = z.infer<typeof itemAnalysisSchema>;
