import { z } from 'zod';
export const projectSchema=z.object({title:z.string().trim().min(2,'Use at least 2 characters').max(120),tagline:z.string().max(200),description:z.string().max(20000),category:z.string().max(80),website_url:z.union([z.literal(''),z.url().refine(v=>/^https?:\/\//.test(v),'Use an http or https URL')]),logo_url:z.union([z.literal(''),z.url()]),status:z.enum(['draft','published','archived'])});
export type ProjectInput=z.infer<typeof projectSchema>;
