import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import type { QuestionModel } from "~/types/Form";

export const formRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  createForm: publicProcedure
    .input(
      z.object({
        formId: z.string(),
        name: z.string(),
        formObject: z.any(),
        createdById: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const results = await ctx.db.form.create({
        data: {
          formId: input.formId,
          name: input.name,
          formObject: input.formObject as QuestionModel[],
          createdById: input.createdById,
        },
      });

      return results;
    }),

  getUsersForms: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.form.findMany({
        where: { createdById: { equals: input.userId } },
        orderBy: { createdAt: "desc" },
      });

      return results;
    }),

  getSpecificFormId: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.form.findFirst({
        where: { formId: { equals: input.formId } },
        orderBy: { createdAt: "desc" },
      });

      return results;
    }),
  getPastFormVersions: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.form.findMany({
        where: { formId: { equals: input.formId } },
        orderBy: { createdAt: "desc" },
        skip: 1,
      });

      return results;
    }),
  getSpecificVersionId: protectedProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.form.findUnique({
        where: { id: input.formId },
      });

      return results;
    }),
});
