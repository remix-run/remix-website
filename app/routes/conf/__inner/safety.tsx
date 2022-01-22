import type { MetaFunction } from "remix";

export const meta: MetaFunction = () => ({
  title: "Remix Conf Discord Server",
  description: "Much of our coordination happens on Discord.",
});

export default function Safety() {
  return (
    <div>
      <h1 className="font-display text-m-h1 sm:text-d-h2 text-white xl:text-d-j mb-16">
        COVID-19 and Participant Safety
      </h1>
      <div className="container text-m-p-lg lg:text-d-p-lg text-white flex flex-col gap-4">
        <p>
          Remix Conf is committed to making sure everyone is safe and healthy.
          Like everyone else, we're monitoring the COVID situation and will
          adjust plans as necessary. We'll keep all attendees and sponsors
          informed if changes to the schedule or venue are made.
        </p>
        <p>
          In addition to following{" "}
          <a className="underline" href="https://coronavirus.utah.gov/">
            local requirements
          </a>{" "}
          we will be implementing a system to help you know the comfort level of
          physical contact one another while at the conference (no contact, fist
          bumps, hand shakes, etc.).
        </p>
        <p>
          If you are not vaccinated, please{" "}
          <a className="underline" href="https://www.testutah.com/">
            get tested
          </a>{" "}
          before attending
          {"."}
        </p>
        <p>
          If you have any questions or concerns, please email us at{" "}
          <strong>
            <a className="underline" href="mailto:conf@remix.run">
              conf@remix.run
            </a>
            {". "}
          </strong>
        </p>
      </div>
      <img
        className="w-48 block m-auto mt-16"
        src="/conf-images/covid-image.png"
        alt="COVID-19 sticker saying I got my covid-19 vaccine"
      />
    </div>
  );
}
