const { z } = require('zod');

const menuOptionSchema = z.object({
  id: z.string().min(1, 'Option ID is required'),
  name: z.string().min(1, 'Option name is required'),
  isDefault: z.boolean().default(false),
  dietaryTags: z.array(z.string()).optional().default([]),
});

const menuCreateUpdateSchema = z.object({
  dayOfWeek: z.coerce.number().int().min(0).max(6, 'Day of week must be 0 (Sunday) to 6 (Saturday)'),
  mealType: z.enum(['breakfast', 'lunch', 'snacks', 'dinner']),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Start time must be HH:MM format (24h)'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'End time must be HH:MM format (24h)'),
  title: z.string().min(2, 'Menu title required').max(150),
  description: z.string().max(500).optional().default(''),
  options: z.array(menuOptionSchema).min(1, 'At least one meal option must be specified'),
});

const mealPreferenceSchema = z.object({
  mealDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Meal date must be in YYYY-MM-DD format'),
  mealType: z.enum(['breakfast', 'lunch', 'snacks', 'dinner']),
  selectedOptionId: z.string().min(1, 'Selected option ID is required'),
});

const cutoffConfigSchema = z.object({
  hour: z.coerce.number().int().min(0).max(23),
  minute: z.coerce.number().int().min(0).max(59),
});

module.exports = {
  menuCreateUpdateSchema,
  mealPreferenceSchema,
  cutoffConfigSchema,
};
