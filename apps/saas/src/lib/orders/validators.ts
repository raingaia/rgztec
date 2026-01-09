import { z } from "zod";

export const listOrdersQuerySchema = z.object({
  q: z.string().trim().optional(),
  status: z.string().trim().optional(),
  seller_id: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().trim().optional(),
});

export const patchOrderSchema = z.object({
  status: z.string().trim().optional(),
  note: z.string().trim().max(500).optional(),
});

export type ListOrdersQuery = z.infer<typeof listOrdersQuerySchema>;
export type PatchOrderBody = z.infer<typeof patchOrderSchema>;
