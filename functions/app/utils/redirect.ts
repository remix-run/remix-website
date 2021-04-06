import { redirect } from "@remix-run/node";

export default function (request, to, init = undefined) {
  // firebase in dev redirects to 5001 😩
  let url = new URL(request.url);
  let origin = url.protocol + "//" + url.host;
  return redirect(`${origin}${to}`, init);
}
