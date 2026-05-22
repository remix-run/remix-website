export type SubscribeState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success"; shouldReset: true }
  | { status: "error"; message: string };

export async function submitNewsletterRequest({
  action,
  formData,
  signal,
  fetchImpl = fetch,
}: {
  action: string;
  formData: FormData;
  signal: AbortSignal;
  fetchImpl?: typeof fetch;
}): Promise<SubscribeState> {
  let body = new URLSearchParams();
  for (let [key, value] of formData.entries()) {
    if (typeof value === "string") body.append(key, value);
  }

  try {
    let response = await fetchImpl(action, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: body.toString(),
      signal,
    });

    let payload = (await response.json().catch(() => null)) as {
      ok?: boolean;
      error?: string;
    } | null;

    if (response.ok && payload?.ok) {
      return { status: "success", shouldReset: true };
    }

    return {
      status: "error",
      message: payload?.error ?? "Something went wrong",
    };
  } catch (error) {
    if (
      signal.aborted ||
      (error instanceof DOMException && error.name === "AbortError")
    ) {
      return { status: "idle" };
    }

    return {
      status: "error",
      message: "Something went wrong",
    };
  }
}
