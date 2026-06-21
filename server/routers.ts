import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { analyzeBillWithDeepSeek, extractTextFromBase64 } from "./deepseek";
import { createUserSubmission, getAllUserSubmissions } from "./db";

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

  submissions: router({
    create: publicProcedure
      .input(
        z.object({
          fullName: z.string().min(1, "Full name is required").max(255, "Full name too long"),
          phone: z.string()
            .min(1, "Phone is required")
            .regex(/^\+?[0-9\s\-\(\)]{7,20}$/, "Phone must be 7-15 digits (can include +, -, spaces, ())"),
          country: z.string().min(1, "Country is required"),
          email: z.string()
            .email("Valid email is required")
            .max(320, "Email too long"),
        })
      )
      .mutation(async ({ input }) => {
        try {
          await createUserSubmission({
            fullName: input.fullName,
            phone: input.phone,
            country: input.country,
            email: input.email,
          });
          return {
            success: true,
            message: "User information submitted successfully",
          };
        } catch (error) {
          console.error('Submission error:', error);
          throw new Error('Failed to submit user information');
        }
      }),

    getAll: publicProcedure.query(async () => {
      try {
        const submissions = await getAllUserSubmissions();
        return {
          success: true,
          data: submissions,
        };
      } catch (error) {
        console.error('Get submissions error:', error);
        throw new Error('Failed to retrieve submissions');
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
