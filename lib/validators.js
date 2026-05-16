// Shared zod schemas. Keep them small and composable — used by inline form
// validation and (eventually) API route input validation so a single source
// defines what "valid" means.

import { z } from 'zod';

export const emailSchema = z.string().trim().email('Enter a valid email.');

export const urlSchema = z
  .string()
  .trim()
  .url('Enter a full URL including https://')
  .refine((u) => /^https?:\/\//i.test(u), 'URL must start with http:// or https://');

export const requiredString = (label = 'This field') =>
  z.string().trim().min(1, `${label} is required.`);

export const profileSchema = z.object({
  name: requiredString('Name'),
  title: z.string().trim().optional(),
  location: z.string().trim().optional(),
  bio: z.string().trim().optional(),
});

export const storySchema = z.object({
  title: requiredString('Title'),
  lesson: requiredString('Lesson'),
  category: z.enum(['pain', 'prize', 'news']).optional(),
});

export const subscriberSchema = z.object({
  email: emailSchema,
  name: z.string().trim().optional(),
});

// Helper: returns { ok: true, data } or { ok: false, errors: Record<field, msg> }
export function validate(schema, value) {
  const result = schema.safeParse(value);
  if (result.success) return { ok: true, data: result.data };
  const errors = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join('.') || '_';
    if (!errors[path]) errors[path] = issue.message;
  }
  return { ok: false, errors };
}
