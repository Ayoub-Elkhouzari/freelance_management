const { z } = require("zod");

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createClientSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["entreprise", "particular"]).optional(),
  contact_name: z.string().optional(),
  contact_email: z.string().email().optional(),
  contact_phone: z.string().optional(),
  billing_address: z.string().optional(),
  notes: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial().extend({
  is_archived: z.union([z.boolean(), z.coerce.number().int()]).optional(),
});

const listClientsSchema = z.object({
  q: z.string().optional(),
  type: z.enum(["entreprise", "particular"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
  includeArchived: z
    .union([z.boolean(), z.coerce.number().int()])
    .optional(),
});

module.exports = {
  idParamSchema,
  createClientSchema,
  updateClientSchema,
  listClientsSchema,
};
