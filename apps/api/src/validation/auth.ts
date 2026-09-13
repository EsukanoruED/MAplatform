import { z } from 'zod';

/**
 * Login payload. Email is normalised to lower case here so the same address
 * always resolves to one account regardless of how it was typed.
 *
 * `.strict()` is deliberate: it rejects any extra field, which means a client
 * cannot smuggle a `companyId` or `role` into a login body.
 */
export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .min(1, 'Email is required.')
      .max(320, 'Email is too long.')
      .pipe(z.string().email('Enter a valid email address.'))
      .transform((v) => v.toLowerCase()),
    password: z
      .string()
      .min(1, 'Password is required.')
      .max(200, 'Password is too long.'),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;
