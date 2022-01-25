import { Link, MetaFunction } from "remix";

export const meta: MetaFunction = () => ({
  title: "May 24th at Remix Conf",
  description: "May 24th is The Workshop and Welcome day at Remix.",
});

export default function May24Schedule() {
  return (
    <div>
      <strong>Workshop & Welcome Day</strong>
      <p>
        This is the day before the big event. We'll be holding two{" "}
        <Link className="underline" to="/conf/workshops">
          workshops
        </Link>{" "}
        as well as a welcome reception, both at the{" "}
        <Link className="underline" to="/conf/venue">
          Venue
        </Link>
        . Come hang out with fellow Remix attendees, grab a snack, and get
        registered to avoid the morning lines!{" "}
        <a href="https://rmx.as/tickets" className="underline">
          Join us!
        </a>
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
            <td className="p-3 border">10:00am - 4:00pm</td>
            <td className="p-3 border">
              <Link className="underline" to="/conf/workshops">
                Workshops
              </Link>
            </td>
          </tr>
          <tr>
            <td className="p-3 border">6:00pm - 9:00pm</td>
            <td className="p-3 border">Welcome Reception</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
