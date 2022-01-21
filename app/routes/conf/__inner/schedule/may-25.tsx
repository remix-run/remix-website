import { Link, MetaFunction } from "remix";

export const meta: MetaFunction = () => ({
  title: "May 25th at Remix Conf",
  description: "May 25th is the day of the conference at Remix Conf.",
});

export default function May25Schedule() {
  return (
    <div>
      <strong>Remix Conference</strong>
      <p>
        This is conference day! Prepared to be blown away by what the speakers
        do with Remix and distributed architecture!{" "}
        <Link className="underline" to="/conf/speak">
          (Want to Speak?)
        </Link>
      </p>
      <table className="w-full mt-10 border-collapse">
        <thead>
          <tr>
            <th>Time</th>
            <th>Event</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-3 border">9:00am - 4:30pm</td>
            <td className="p-3 border">
              Single Track Conference{" "}
              <Link className="underline" to="/conf#speakers">
                (Speakers)
              </Link>
            </td>
          </tr>
          <tr>
            <td className="p-3 border">7:00pm - 10:00pm</td>
            <td className="p-3 border">After Party</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
