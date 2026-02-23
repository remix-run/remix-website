import { z } from "zod";

type NewsletterResponse = { ok: boolean; error: string | null };

// TODO: replace with remix/data-schema
const newsletterSubmission = z.object({
  email: z.string().email(),
  tags: z.array(z.coerce.number()),
});

export default {
  async newsletter(context: { request: Request; formData?: FormData }) {
    if (context.request.method.toUpperCase() !== "POST") {
      return Response.json(
        { ok: false, error: "Method Not Allowed" } satisfies NewsletterResponse,
        { status: 405 },
      );
    }

    const formData = context.formData ?? (await context.request.formData());
    const result = newsletterSubmission.safeParse({
      email: formData.get("email"),
      tags: formData.getAll("tag"),
    });
    if (!result.success) {
      const hasEmailIssue = result.error.issues.some((issue) =>
        issue.path.includes("email"),
      );
      const hasTagIssue = result.error.issues.some((issue) =>
        issue.path.includes("tags"),
      );
      return Response.json(
        {
          ok: false,
          error: hasEmailIssue
            ? "Invalid Email"
            : hasTagIssue
              ? "Invalid Tag"
              : "Invalid Submission",
        } satisfies NewsletterResponse,
        { status: 400 },
      );
    }

    try {
      await subscribeToNewsletter(result.data.email, result.data.tags);
      return Response.json({
        ok: true,
        error: null,
      } satisfies NewsletterResponse);
    } catch (error: unknown) {
      return Response.json(
        {
          ok: false,
          error:
            error instanceof Error ? error.message : "Something went wrong",
        } satisfies NewsletterResponse,
        { status: 500 },
      );
    }
  },
};

async function subscribeToNewsletter(email: string, tags: number[] = []) {
  const apiKey = process.env.CONVERTKIT_KEY;
  if (!apiKey) {
    throw new Error("Missing CONVERTKIT_KEY");
  }

  const apiUrl = process.env.CONVERTKIT_API_URL ?? "https://api.convertkit.com/v3";
  const formId = process.env.CONVERTKIT_FORM_ID ?? "1334747";

  const response = await fetch(`${apiUrl}/forms/${formId}/subscribe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      api_key: apiKey,
      email,
      tags,
    }),
  });

  const data = (await response.json()) as { error?: string };
  if (data.error) {
    throw new Error(data.error);
  }
}
