import { MetaFunction } from "remix";

export const meta: MetaFunction = () => ({
  title: "May 25th at Remix Conf",
  description: "May 25th is the day of the conference at Remix Conf.",
});

export default function May25Schedule() {
  return (
    <div>
      <strong>Remix Conference</strong>
      <p>This is conference day!</p>
    </div>
  );
}
