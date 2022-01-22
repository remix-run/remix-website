import { primaryButtonLinkClass } from "~/components/buttons";

export default function Workshops() {
  return (
    <div className="text-white">
      <h1 className="font-display text-m-h1 sm:text-d-h2 xl:text-d-j mb-16">
        Premium Remix Workshops from the Remix Team
      </h1>
      <div className="container text-m-p-lg lg:text-d-p-lg flex flex-col gap-4">
        <p>
          Remix workshops are a great way to get insights and experience from
          the Remix team on how to use Remix to build stellar user experiences.
          They happen the day before the conference at the venue. Lunch, snacks,
          and beverages are included.
        </p>
        <div className="text-center">
          <a
            href="https://rmx.as/tickets"
            className={`${primaryButtonLinkClass} font-display uppercase`}
            children="Get Tickets"
          />
        </div>
      </div>
      <div className="mt-12 container grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <div className="flex flex-row lg:flex-col gap-4">
            <img src="/k.jpg" alt="Kent C. Dodds" className="w-24 rounded-md" />
            <div>
              <h2 className="font-display text-m-h2 lg:text-d-h2">
                Remix Fundamentals
              </h2>
              <p>with Kent C. Dodds</p>
            </div>
          </div>
          <div className="mt-4 text-m-p-lg lg:text-d-p-lg flex flex-col gap-6">
            <p>
              The perfect workshop for ramping yourself up on Remix the day
              before Remix conf.
            </p>
            <p>At the end of this workshop, you'll know how to:</p>
            <ul className="list-disc list-inside">
              <li>Bootstrap a new Remix app</li>
              <li>Create Remix Routes</li>
              <li>Style Remix applications</li>
              <li>Load data in Remix loaders</li>
              <li>Mutate data with forms and actions</li>
              <li>Handle errors (both expected and unexpected)</li>
            </ul>
          </div>
        </div>
        <div>
          <div className="flex flex-row lg:flex-col gap-4">
            <img src="/r.jpg" alt="Ryan Florence" className="w-24 rounded-md" />
            <div>
              <h2 className="font-display text-m-h2 lg:text-d-h2">
                Advanced Remix
              </h2>
              <p>with Ryan Florence</p>
            </div>
          </div>
          <div className="mt-4 text-m-p-lg lg:text-d-p-lg flex flex-col gap-6">
            <p>Details coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
