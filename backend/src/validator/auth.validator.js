const { z } = require("zod");

const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8),

    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),

    currency: z.string().length(3).optional(), // EUR, USD...

    company_name: z.string().max(255).nullable().optional().or(z.literal("")),
    address: z.string().nullable().optional().or(z.literal("")),
    tax_id: z.string().max(50).nullable().optional().or(z.literal("")),
    logo_url: z.string().url().max(500).nullable().optional().or(z.literal("")),
  })
  .strict();

const loginSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
  })
  .strict();

  module.exports = {
    registerSchema,
    loginSchema,
  }
