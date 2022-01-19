export default function Speak() {
  return (
    <div>
      <h1 className="font-jet-mono text-m-h1 sm:text-d-h2 text-white xl:text-d-j mb-16">
        Speak at Remix Conf
      </h1>
      <div className="container text-m-p-lg lg:text-d-p-lg text-white flex flex-col gap-4">
        <p>
          We're excited that you're interested in speaking at Remix Conf! We're
          fiercely focused on improving the user experience for the web and the
          conference will reflect this. We'd love to hear what you'd like to
          speak about at Remix Conf to inspire people to improve their web app's
          user experience.
        </p>
        <p>Remix Conf is on May 25th in Salt Lake City, Utah.</p>
        <p>
          As a speaker, we'll pay to fly you out, stay in a hotel, and even give
          you some spending money while you're here.
        </p>
        <p>
          This CFP is open from now until February 28th at midnight. We'll
          update you about your proposal on or before March 14th.
        </p>
        <p>
          Please fill out{" "}
          <a className="underline" href="https://rmx.as/cfp">
            the Remix Conf CFP form here.
          </a>
        </p>
      </div>
    </div>
  );
}
