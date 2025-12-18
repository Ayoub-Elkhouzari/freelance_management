const { z } = require("zod");

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const createProjectSchema = z.object({
  client_id: z.coerce.number().int().positive().optional(),
  name: z.string().min(1),

  description: z.string().optional(),
  status: z.enum(["active", "paused", "finished"]).optional(),

  start_date: z.string().optional(),
  end_date_estimated: z.string().optional(),

  hourly_rate: z.coerce.number().nonnegative().optional(),
  fixed_amount: z.coerce.number().nonnegative().optional(),
});

const updateProjectSchema = createProjectSchema.partial();

const listProjectsSchema = z.object({
  q: z.string().optional(),
  status: z.enum(["active", "paused", "finished"]).optional(),
  client_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

module.exports = {
  idParamSchema,
  createProjectSchema,
  updateProjectSchema,
  listProjectsSchema,
};
