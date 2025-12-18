const { z } = require("zod");

const idParamSchema = z.object({ id: z.coerce.number().int().positive() });
const projectIdParamSchema = z.object({ projectId: z.coerce.number().int().positive() });

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const createTimeEntrySchema = z.object({
  task_id: z.coerce.number().int().positive().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(timeRegex).optional(),
  end_time: z.string().regex(timeRegex).optional(),
  duration_minutes: z.coerce.number().int().positive(), // NOT NULL in DB
  description: z.string().max(500).optional(),
});

const updateTimeEntrySchema = z.object({
  task_id: z.union([z.coerce.number().int().positive(), z.null()]).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  start_time: z.union([z.string().regex(timeRegex), z.null()]).optional(),
  end_time: z.union([z.string().regex(timeRegex), z.null()]).optional(),
  duration_minutes: z.coerce.number().int().positive().optional(),
  description: z.union([z.string().max(500), z.null()]).optional(),
}).partial();

const listTimeEntriesSchema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  task_id: z.coerce.number().int().positive().optional(),
  billed: z.union([z.boolean(), z.coerce.number().int()]).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

module.exports = {
  idParamSchema,
  projectIdParamSchema,
  createTimeEntrySchema,
  updateTimeEntrySchema,
  listTimeEntriesSchema,
};
