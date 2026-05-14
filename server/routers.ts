import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { analyzeBillWithDeepSeek, extractTextFromBase64 } from "./deepseek";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  bills: router({
    analyze: publicProcedure
      .input(
        z.object({
          files: z.array(
            z.object({
              name: z.string(),
              type: z.string(),
              size: z.number(),
              base64: z.string(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        try {
          // Extract text from all uploaded files
          const textContents = await Promise.all(
            input.files.map((file) => extractTextFromBase64(file.base64, file.name))
          );

          // Combine all text content
          const combinedContent = textContents
            .map((content, index) => `File ${index + 1}: ${input.files[index].name}\n${content}`)
            .join('\n\n---\n\n');

          // Analyze with DeepSeek
          const report = await analyzeBillWithDeepSeek(combinedContent);

          return {
            success: true,
            report,
          };
        } catch (error) {
          console.error('Bill analysis error:', error);
          throw new Error('Failed to analyze bills');
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
