import { redirect } from "@remix-run/data";

export default function (request, to, init) {
  // firebase in dev redirects to 5001 😩
  let url = new URL(request.url);
  let origin = url.protocol + "//" + url.host;
  return redirect(`${origin}${to}`, init);
}
