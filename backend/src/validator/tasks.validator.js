const { z } = require("zod");

const idParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

const projectIdParamSchema = z.object({
  projectId: z.coerce.number().int().positive(),
});

const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  status: z.enum(["todo", "doing", "done"]).optional(),
  priority: z.enum(["low", "moderate", "high"]).optional(),
  due_date: z.string().optional(), // "YYYY-MM-DD"
  estimated_hours: z.coerce.number().nonnegative().optional(),
});

const updateTaskSchema = createTaskSchema.partial();

const listTasksSchema = z.object({
  q: z.string().optional(),
  status: z.enum(["todo", "doing", "done"]).optional(),
  priority: z.enum(["low", "moderate", "high"]).optional(),
  due_date: z.string().optional(), // ✅ exact match
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

module.exports = {
  idParamSchema,
  projectIdParamSchema,
  createTaskSchema,
  updateTaskSchema,
  listTasksSchema,
};
