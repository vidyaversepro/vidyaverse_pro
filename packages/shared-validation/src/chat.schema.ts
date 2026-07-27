import { z } from 'zod';

export const createConversationSchema = z.object({
  type: z.enum(['direct', 'group']),
  name: z.string().min(1).max(255).optional(),
  participantUserIds: z.array(z.string().uuid()).min(1).max(50),
});

export const listMessagesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export const livekitTokenRequestSchema = z.object({
  conversationId: z.string().uuid(),
  callType: z.enum(['audio', 'video']).default('video'),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type ListMessagesQuery       = z.infer<typeof listMessagesQuerySchema>;
export type LivekitTokenRequest     = z.infer<typeof livekitTokenRequestSchema>;
