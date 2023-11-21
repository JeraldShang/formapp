import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";

type inputType = "text" | "radio" | "checkbox";
type questionModel = {
  id: number;
  question: string;
  inputType: inputType;
  response: string | object;
};

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
          formObject: input.formObject,
          createdById: input.createdById,
        },
      });
      console.log(results);
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

  getSpecificForm: publicProcedure
    .input(z.object({ formId: z.string() }))
    .query(async ({ ctx, input }) => {
      const results = await ctx.db.form.findFirst({
        where: { formId: { equals: input.formId } },
        orderBy: { createdAt: "desc" },
      });

      return results;
    }),

  // getLatest: protectedProcedure.query(({ ctx }) => {
  //   return ctx.db.post.findFirst({
  //     orderBy: { createdAt: "desc" },
  //     where: { createdBy: { id: ctx.session.user.id } },
  //   });
  // }),

  // getSecretMessage: protectedProcedure.query(() => {
  //   return "you can now see this secret message!";
  // }),
});
