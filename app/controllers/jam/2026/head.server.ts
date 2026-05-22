import { getRequestContext } from "../../../utils/request-context.ts";
import { getJam2026ServerHeadTags } from "./head-content.ts";

type Jam2026HeadTagsProps = {
  title: string;
  description: string;
};

export function getJam2026HeadTags(props: Jam2026HeadTagsProps) {
  return getJam2026ServerHeadTags({
    ...props,
    requestUrl: getRequestContext().request.url,
  });
}
