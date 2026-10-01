import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().default('其他'),
    tags: z.array(z.string()).default([]),
    csdnUrl: z.string().url().optional(),
    draft: z.boolean().default(false)
  })
});

export const collections = { articles };
