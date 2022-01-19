import { outlineButtonLinkClass } from "~/components/buttons";

export default function Workshops() {
  return (
    <div className="text-white">
      <h1 className="font-jet-mono text-m-h1 sm:text-d-h2 xl:text-d-j mb-16">
        Premium Remix Workshops from the Remix Team
      </h1>
      <div className="container text-m-p-lg lg:text-d-p-lg flex flex-col gap-4">
        <p>
          Remix workshops are a great way to get insights and experience from
          the Remix team on how to use Remix to build stellar user experiences.
          They happen the day before the conference at the venue. Lunch, snacks,
          and beverages are included.
        </p>
      </div>
      <div className="container grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <img src="/k.jpg" alt="Kent C. Dodds" className="w-24 rounded-md" />
          <h2 className="text-m-h2 lg:text-d-h2">Remix Fundamentals</h2>
          <p>Details coming soon.</p>
        </div>
        <div>
          <img src="/r.jpg" alt="Ryan Florence" className="w-24 rounded-md" />
          <h2 className="text-m-h2 lg:text-d-h2">Advanced Remix</h2>
          <p>Details coming soon.</p>
        </div>
      </div>
      <div className="flex justify-center mt-20">
        <a
          href="https://rmx.as/tickets"
          className={`${outlineButtonLinkClass} w-full md:w-auto font-jet-mono uppercase`}
          children="Get Tickets"
        />
      </div>
    </div>
  );
}
