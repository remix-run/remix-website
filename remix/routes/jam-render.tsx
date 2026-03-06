import type { RemixNode } from "remix/component/jsx-runtime";
import { Document } from "../components/document";
import { isAppFrameRequest, render } from "../utils/render";
import { JamPageFrame } from "./jam-shared";

interface JamPageRenderProps {
  request: Request;
  cacheControl: string;
  title: string;
  description: string;
  pageUrl: string;
  previewImage: string;
  activePath: string;
  hideBackground?: boolean;
  showSeats?: boolean;
  children: RemixNode;
}

export function renderJamPage(props: JamPageRenderProps) {
  let { request, cacheControl, ...pageProps } = props;

  if (isAppFrameRequest(request)) {
    return render.frame(<JamPageFrame {...pageProps} />, {
      headers: {
        "Cache-Control": cacheControl,
      },
    });
  }

  return render.document(<Document forceTheme="dark" appFrameSrc={request.url} />, {
    headers: {
      "Cache-Control": cacheControl,
    },
  });
}
