import { MetaFunction } from "remix";

export const meta: MetaFunction = () => ({
  title: "May 26th at Remix Conf",
  description:
    "May 26th is the day after the conference. Get together with other conference attendees before heading home.",
});

export default function May25Schedule() {
  return (
    <div>
      <strong>Post-conference fun</strong>
      <p>This is post-conference day!</p>
    </div>
  );
}
