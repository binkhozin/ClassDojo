import * as z from "zod";

export const createStudentSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  date_of_birth: z.string().optional(),
  notes: z.string().optional(),
  avatar_url: z.string().optional(),
});

export const updateStudentSchema = createStudentSchema.partial();

export type CreateStudentValues = z.infer<typeof createStudentSchema>;
export type UpdateStudentValues = z.infer<typeof updateStudentSchema>;
