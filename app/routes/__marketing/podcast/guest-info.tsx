import { Link, MetaFunction } from "remix";
import { useSearchParams } from "remix";

function ZencastrLink() {
  const [searchParams] = useSearchParams();
  const zencastrParam = searchParams.get("zencastr");
  const link = zencastrParam
    ? `https://zencastr.com/kentremix/${zencastrParam
        .replace(/'/g, "")
        .toLowerCase()}`
    : null;

  return link ? (
    <a
      className="text-d-p-lg font-bold underline"
      target="_blank"
      rel="noopener"
      href={link}
    >
      Join Your Zencastr Here{" "}
      <span role="img" aria-label="microphone">
        🎙
      </span>
    </a>
  ) : (
    <div>
      The calendar event you receive will have a special link and a link to
      connect to zencastr will show up here.
    </div>
  );
}

export let meta: MetaFunction = () => {
  return {
    title: "The Remix Podcast",
    description: "Let's build better websites",
  };
};

export default function PodcastRoute() {
  return (
    <div>
      <h2 className="font-display text-m-h1 lg:text-d-h1 mb-4">
        You're a guest! Yay!
      </h2>
      <section className="mb-10">
        <p className="text-m-p-lg lg:text-d-p-lg mb-2">
          This is awesome. I'm super excited to have you on{" "}
          <Link to="/podcast" className="underline">
            The Remix Podcast
          </Link>
          . I know you're busy, so I'll keep this brief and you can feel free to
          ping me if you have any questions, cool? Cool. So here's the info you
          need to know to prepare for our podcast recording.
        </p>
        <ol className="list-decimal list-inside">
          <li>It's a 30 minute long podcast</li>
          <li>It's really chill. No need to study up ahead of time</li>
          <li>
            The podcast is audio only. We do use Zencastr's video support so we
            can see one another though. (You can turn off your webcam if you
            want though).
          </li>
          <li>
            We use Zencastr to connect/record.{" "}
            <a
              href="https://youtu.be/VcCJkiDeh0g"
              className="underline"
              rel="noopener"
            >
              Here's a short intro to Zencastr
            </a>{" "}
            (you don't need to install anything).
          </li>
          <li>Try to be somewhere quiet.</li>
          <li>
            When we're done, please stay on the page until Zencastr finishes
            uploading your audio (the `mp3` backup uploads quickly, but the
            `wav` can take some time).
          </li>
          <li>Please review the code of conduct below.</li>
        </ol>
      </section>
      <section className="mb-10">
        <h3 className="text-m-h3 lg:text-d-h3 mb-2">Key Takeaways</h3>
        <p className="text-m-p-lg lg:text-d-p-lg">
          The goal of the podcast is to help people improve the user experience
          of the apps they build. You were invited onto the podcast because we
          believe you have something to say about improving user experience.
          We'll chat about UX for a while and at the end, we'll try to sum up
          the key takeaway we want people to think about applying to their own
          apps. It doesn't need to be related to Remix specifically. Just
          something to make their app's UX better.
        </p>
      </section>

      <section className="mb-10">
        <h3 className="text-m-h3 lg:text-d-h3 mb-2">Ready to go? 🚀</h3>
        <p className="text-m-p-lg lg:text-d-p-lg">
          <ZencastrLink />
        </p>
      </section>

      <section>
        <h3 className="text-m-h3 lg:text-d-h3 mb-2">Code of Conduct</h3>
        <p className="text-m-p-lg lg:text-d-p-lg">
          In addition to the general{" "}
          <a
            href="https://github.com/remix-run/remix/blob/main/CODE_OF_CONDUCT.md"
            className="underline"
            rel="noopener"
          >
            conduct
          </a>{" "}
          rules, please keep the following points in mind when on "The Remix
          Podcast" show:
        </p>
        <ul className="list-disc list-inside">
          <li>
            Avoid the use of offensive language (curse words are inappropriate
            on this show).
          </li>
          <li>
            Opinions are great. Please express them in a way that is not unkind
            to alternate opinions. (No trolling).
          </li>
          <li>Hopefully I don't have a reason to add anything else here...</li>
        </ul>
      </section>
    </div>
  );
}
