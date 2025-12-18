const { z } = require("zod");

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });

const createInvoiceSchema = z.object({
  client_id: z.coerce.number().int().positive(),
  number: z.string().min(1).max(50),
  issue_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["draft", "sent", "paid", "delayed"]).optional(),
  currency: z.string().length(3).optional(),
  total_ht: z.coerce.number().nonnegative(),
  total_tva: z.coerce.number().nonnegative().optional(),
  total_ttc: z.coerce.number().nonnegative(),
});

const updateInvoiceSchema = createInvoiceSchema.partial();

const listInvoicesSchema = z.object({
  status: z.enum(["draft", "sent", "paid", "delayed"]).optional(),
  client_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

module.exports = { idParamSchema, createInvoiceSchema, updateInvoiceSchema, listInvoicesSchema };
