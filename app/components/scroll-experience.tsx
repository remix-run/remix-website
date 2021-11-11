import * as React from "react";
import { ScrollStage, Actor, useStage, useActor } from "./stage";
// @ts-expect-error
import { easeInExpo, linear } from "tween-functions";
import { formatStackTrace } from "@remix-run/node/errors";

export function ScrollExperience() {
  return (
    <div>
      <Intro />
      <div className="h-60" />
      <NestedRoutes />
      <div className="h-[25vh]" />
      <Spinnageddon />
      <div className="h-[25vh]" />
      <Waterfall />
      <div className="h-[100vh]" />
    </div>
  );
}

function WaterfallHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-d-p-lg font-bold text-white text-center mb-2">
      {children}
    </div>
  );
}

function Waterfall() {
  let progress = 0.25;
  return (
    <div>
      <P2>
        Because of nested routes, Remix can load all layout data in parallel.
        Without this insight, you end up fetching in components with
        render+fetch waterfalls. Look at how{" "}
        <Em>the shape of the network requests effects the UI</Em>. Parallel
        loading isn't just faster, it's a better user experience w/o all that
        jank.
      </P2>
      <ScrollStage pages={2}>
        <div className="sticky top-0">
          <div className="h-8" />

          <WaterfallHeader>Without Remix</WaterfallHeader>
          <div className="scale-75 origin-top -mb-14">
            <Actor start={0.52} end={0.9} persistent>
              <WithoutRemix />
            </Actor>
          </div>

          <WaterfallHeader>With Remix</WaterfallHeader>
          <div className="scale-75 origin-top">
            <Actor start={0.52} end={0.9} persistent>
              <WithRemix />
            </Actor>
          </div>
        </div>
      </ScrollStage>
    </div>
  );
}

function JankSpinner({ className }: { className?: string }) {
  return (
    <div className={"h-full w-full" + " " + className}>
      <img
        src="/loading.gif"
        className="h-full w-full object-contain object-top"
      />
    </div>
  );
}

function WithoutRemix() {
  let actor = useActor();
  let progress = actor.progress * 100;

  let resources: [string, number, number][] = [
    ["document", 0, 10],
    ["root.js", 10, 25],
    ["user.json", 35, 10],
    ["sales.js", 35, 21],
    ["sales/nav.json", 56, 5],
    ["invoices.js", 56, 10],
    ["invoice.js", 66, 22],
    ["invoice/{id}.json", 88, 12],
  ];

  let jank: [number, React.ReactNode][] = [
    [10, <JankSpinner className="p-8" />],
    [
      35,
      <Fakebooks className="h-[12rem]">
        <JankSpinner className="p-12" />
      </Fakebooks>,
    ],
    [
      56,
      <Fakebooks className="h-[12rem]">
        <Sales shimmerNav>
          <div className="h-[6rem]">
            <JankSpinner className="p-8" />
          </div>
        </Sales>
      </Fakebooks>,
    ],
    [
      66,
      <Fakebooks className="h-[12rem]">
        <Sales>
          <Invoices>
            <JankSpinner className="p-10" />
          </Invoices>
        </Sales>
      </Fakebooks>,
    ],
    [
      100,
      <Fakebooks className="h-[12rem]">
        <Sales>
          <Invoices>
            <Invoice />
          </Invoices>
        </Sales>
      </Fakebooks>,
    ],
  ];

  let aboutBlank = <div className="bg-white h-full w-full" />;
  let screen: React.ReactNode = aboutBlank;

  // just practicing my interview skills in case remix tanks.
  let i = jank.length;
  while (i--) {
    let [start, element] = jank[i];
    if (progress >= start) {
      screen = element;
      break;
    }
  }

  return (
    <BrowserChrome
      url={progress === 0 ? "about:blank" : "example.com/sales/invoices/102000"}
    >
      <div className="h-[12rem] bg-white">{screen}</div>

      {/* <Fakebooks className="h-[12rem]">
        <Sales>
          <Invoices>
            <Invoice />
          </Invoices>
        </Sales>
      </Fakebooks> */}
      <Network>
        {resources.map(([name, start, size]) => (
          <Resource key={name} name={name} start={start} size={size} />
        ))}
      </Network>
    </BrowserChrome>
  );
}

function WithRemix() {
  let actor = useActor();
  let progress = actor.progress * 100;

  return (
    <BrowserChrome
      url={progress === 0 ? "about:blank" : "example.com/sales/invoices/102000"}
    >
      {progress < 27 ? (
        <div className="bg-white h-[12rem]" />
      ) : (
        <Fakebooks className="h-[12rem]">
          <Sales>
            <Invoices>
              <Invoice />
            </Invoices>
          </Sales>
        </Fakebooks>
      )}

      <Network>
        <Resource name="document" start={0} size={10 + 12 + 5} />
        <Resource name="root.js" start={27} size={30} />
        <Resource name="sales.js" start={27} size={21} />
        <Resource name="invoices.js" start={27} size={8} />
        <Resource name="invoice.js" start={27} size={10} />
      </Network>
    </BrowserChrome>
  );
}

function Network({ children }: { children: React.ReactNode }) {
  let actor = useActor();
  return (
    <div className="relative mt-4">
      <Ticks />
      <div className="h-4" />
      <div>{children}</div>
      <div className="absolute left-16 top-0 right-0 h-full">
        <div
          className="absolute top-0 h-full"
          style={{
            left: `${actor.progress * 100}%`,
          }}
        >
          <ProgressHead className="w-2 -ml-1  text-blue-brand" />
          <div className="w-[1px] relative top-[-1px] bg-blue-brand h-full" />
        </div>
      </div>
    </div>
  );
}

function Resource({
  name,
  size,
  start,
}: {
  name: string;
  size: number;
  start: number;
}) {
  let actor = useActor();
  let progress = actor.progress * 100;
  let end = start + size;

  let complete = progress > end;
  let width = complete ? size : Math.max(progress - start, 0);

  return (
    <div className="flex items-center justify-center border-b border-gray-600 last:border-b-0">
      <div className="w-16 text-[length:8px]">{name}</div>
      <div className="flex-1 relative">
        <div
          className={
            "h-1" + " " + (complete ? "bg-green-brand" : "bg-blue-brand")
          }
          style={{
            width: `${width}%`,
            marginLeft: `${start}%`,
          }}
        />
      </div>
    </div>
  );
}

function Ticks() {
  let ticks = Array.from({ length: 50 }).fill(null);
  return (
    <div className="absolute top-0 left-16 right-0 flex justify-around">
      {ticks.map((_, index) => (
        <div
          className={
            (index + 1) % 10
              ? "bg-gray-300 h-1 w-[1px]"
              : "bg-gray-50 w-[1px] h-[6px]"
          }
          key={index}
        />
      ))}
    </div>
  );
}

function ProgressHead({ className }: { className: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 7 14"
    >
      <path
        fill="currentColor"
        d="M0 0h7v9.249a2 2 0 01-.495 1.316L3.5 14 .495 10.566A2 2 0 010 9.248V0z"
      ></path>
    </svg>
  );
}

function Intro() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="text-m-j font-display text-white md:text-d-j">
        While you were <span className="text-red-brand">waiting</span> for your
        static site to build,{" "}
        <span className="text-blue-brand">distributed web</span>{" "}
        infra&shy;structure got really good.{" "}
        <span className="text-pink-brand">Break through the static.</span>
      </div>
      <p className="text-m-p-lg md:text-d-p-lg mt-2 md:pr-52 hyphen-manual">
        Remix automatically provides snappy page loads and instant transitions
        by leveraging distributed systems, not static builds. However, we don't
        wear performance blinders: our end goal is UX, of which TTFB is only one
        aspect. As you've pushed the boundaries of the web, your tools haven't
        caught up to your appetite.{" "}
        <span className="text-white font-bold">Remix is ready</span> to serve
        you from the initial request to the fanciest UX your designers can think
        up. Check it out 👀
      </p>
    </div>
  );
}

function P1({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 md:px-6 mb-10 text-m-p-lg md:text-d-p-lg text-center max-w-xl mx-auto">
      {children}
    </p>
  );
}

function P2({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2 md:px-6 mb-10 text-m-p-lg md:text-d-p-lg text-center max-w-3xl mx-auto">
      {children}
    </p>
  );
}

function Header({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-m-j md:text-d-h2 font-display text-center text-white mb-2 md:mb-4">
      {children}
    </div>
  );
}

function NestedRoutes() {
  return (
    <div>
      <Header>Nested Routes</Header>
      <P2>
        Nearly every feature of Remix takes advantage of the unique insight
        gained from Nested Routes. To understand Remix, you first need to
        understand nested routes.
      </P2>
      <div className="p-6">
        <div className="h-40 md:h-20" />
        <P2>
          Most websites have multiple levels of navigation in layouts that
          control a child component. We've learned these components are not only{" "}
          <Em>coupled to URL segments</Em> but are also the semantic boundary of{" "}
          <Em>data loading</Em> and <Em>code splitting</Em>.
        </P2>
        <P2>Click on the buttons to see how they're all related:</P2>
        <div className="h-20" />
        <div className="sticky bottom-[-10vh] md:bottom-[-20vh]">
          <InteractiveRoutes />
        </div>
      </div>
      <div className="h-20" />
      <P2>
        Typical web apps couple data fetching to components instead of URLs.
        Even in frameworks with data loading and SSG abstractions, as soon as
        you have a logged in user, a large data set, or you're just tired of
        repeating data and layout code across the app, you bail on the
        abstractions and fetch as you render inside of components.
      </P2>
      <P2>
        Fetching inside of components creates a{" "}
        <span className="text-aqua-brand">waterfall</span> of requests on the
        network which makes your app artificially slower, introduces high risk
        of content layout shift, and{" "}
        <span className="text-red-brand">rages spinnageddon</span> on your
        users.
      </P2>
    </div>
  );
}

function Spinnageddon() {
  return (
    <ScrollStage pages={1.5}>
      <Spinners />
      <Actor start={0} end={SPINNER_END}>
        <SayGoodbye />
      </Actor>
      <SayGoodbyeGreen />
    </ScrollStage>
  );
}

function Spinners() {
  let stage = useStage();
  let endBy = 0.5;
  let start = (n: number) => (endBy / 20) * n;
  return (
    <div
      hidden={stage.progress === 0}
      className="fixed inset-0 overflow-hidden"
    >
      <Spinner
        start={start(1)}
        className="11 absolute bottom-[25vh] left-[8vw] h-[8vh] w-[8vh] md:h-[8vw] md:w-[8vw]"
      />
      <Spinner
        start={start(2)}
        className="16 absolute bottom-[23vh] right-[32vw] h-[5vh] w-[5vh] md:h-[5vw] md:w-[5vw]"
      />
      <Spinner
        start={start(3)}
        className="4 absolute top-[24vh] md:top-[16vh] left-[-4vw] h-[13vh] w-[13vh] md:h-[13vw] md:w-[13vw]"
      />
      <Spinner
        start={start(4)}
        className="17 absolute bottom-[-5vh] md:bottom-[-4vh] right-[18vw] h-[13vh] w-[13vh] md:h-[13vw] md:w-[13vw]"
      />
      <Spinner
        start={start(5)}
        className="13 absolute bottom-[-3vh] left-[15vw] md:left-[20vw] h-[13vh] w-[13vh] md:h-[13vw] md:w-[13vw]"
      />
      <Spinner
        start={start(6)}
        className="7 absolute top-[20vh] md:top-[12vh] right-[-2vw] h-[13vh] w-[13vh] md:h-[13vw] md:w-[13vw]"
      />
      <Spinner
        start={start(7)}
        className="14 absolute bottom-[16vh] left-[35vw] h-[5vh] w-[5vh] md:h-[5vw] md:w-[5vw]"
      />
      <Spinner
        start={start(8)}
        className="20 absolute bottom-[10vh] md:bottom-[3vh] right-[-5vw] h-[13vh] w-[13vh] md:h-[13vw] md:w-[13vw]"
      />
      <Spinner
        start={start(9)}
        className="10 absolute bottom-[37vh] md:bottom-[42vh] left-[3vw] h-[5vh] w-[5vh] md:h-[5vw] md:w-[5vw]"
      />
      <Spinner
        start={start(10)}
        className="9 absolute top-[38vh] md:top-[50vh] right-[3vw] h-[5vh] w-[5vh] md:h-[5vw] md:w-[5vw]"
      />
      <Spinner
        start={start(11)}
        className="19 absolute bottom-[36vh] md:bottom-[9vh] right-[10vw] h-[5vh] w-[5vh] md:h-[5vw] md:w-[5vw]"
      />
      <Spinner
        start={start(12)}
        className="15 absolute bottom-[30vh] md:bottom-[2vh] right-[40vw] h-[8vh] w-[8vh] md:h-[8vw] md:w-[8vw]"
      />
      <Spinner
        start={start(13)}
        className="18 absolute bottom-[25vh] right-[7vw] h-[8vh] w-[8vh] md:h-[8vw] md:w-[8vw]"
      />
      <Spinner
        start={start(14)}
        className="6 absolute top-[8vh] right-[22vw] h-[8vh] w-[8vh] md:h-[8vw] md:w-[8vw]"
      />

      <Spinner
        start={start(15)}
        className="3 absolute top-[1vh] right-[10vw] h-[5vh] w-[5vh] md:h-[5vw] md:w-[5vw]"
      />
      <Spinner
        start={start(16)}
        className="12 absolute bottom-[12vh] md:bottom-[2vh] left-[2vw] h-[8vh] w-[8vh] md:h-[8vw] md:w-[8vw]"
      />
      <Spinner
        start={start(17)}
        className="8 absolute top-[35vh] md:top-[25vh] left-[48vw] h-[5vh] w-[5vh] md:h-[5vw] md:w-[5vw]"
      />
      <Spinner
        start={start(18)}
        className="5 absolute top-[20vh] md:top-[12vh] left-[35vw] h-[8vh] w-[8vh] md:h-[8vw] md:w-[8vw]"
      />
      <Spinner
        start={start(19)}
        className="1 absolute top-[-5vh] left-[4vw] md:left-[13vw] h-[13vh] w-[13vh] md:h-[13vw] md:w-[13vw]"
      />
      <Spinner
        start={start(20)}
        className="2 absolute top-[-1vh] right-[40vw] h-[8vh] w-[8vh] md:h-[8vw] md:w-[8vw]"
      />
    </div>
  );
}

let SPINNER_END = 0.9;

function Spinner({ className, start }: { className: string; start: number }) {
  return (
    <Actor start={start} end={SPINNER_END}>
      <img src="/loading.gif" className={className} />
    </Actor>
  );
}

function SayGoodbyeGreen() {
  let stage = useStage();
  return (
    <div
      className={
        `sticky top-0 h-screen text-white flex w-screen items-center justify-center text-center font-display text-[length:48px] leading-[48px] sm:text-[length:65px] sm:leading-[65px] md:text-[length:80px] md:leading-[80px] lg:text-[length:100px] lg:leading-[100px] xl:text-[length:140px] xl:leading-[140px] bg-green-brand` +
        " " +
        (stage.progress < SPINNER_END ? "hidden" : "")
      }
    >
      Say good&shy;bye to Spinnageddon
    </div>
  );
}

function SayGoodbye() {
  let actor = useActor();
  let opacity = easeInExpo(actor.progress, 0, 1, 1);
  let scale = linear(actor.progress, 10, 1, 1);
  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale})`,
      }}
      className={
        `fixed inset-0 h-screen text-white flex w-screen items-center justify-center text-center font-display text-[length:48px] leading-[48px] sm:text-[length:65px] sm:leading-[65px] md:text-[length:80px] md:leading-[80px] lg:text-[length:100px] lg:leading-[100px] xl:text-[length:140px] xl:leading-[140px]` +
        " " +
        (actor.progress > 0 ? "fixed inset-0" : "hidden")
      }
    >
      Say good&shy;bye to Spinnageddon
    </div>
  );
}

function Em({ children }: { children: React.ReactNode }) {
  return <b className="text-white">{children}</b>;
}

export let LayoutButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithRef<"button"> & { active: boolean }
>(({ className, active, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={
        `font-mono font-bold py-2 px-6 m-2 text-[12px] md:text-d-p-sm leading-6 rounded-full opacity-80 ${
          active ? "opacity-100" : ""
        }` +
        " " +
        className
      }
      {...props}
    />
  );
});

function InteractiveRoutes() {
  let [active, setActive] = React.useState(0);

  return (
    <>
      <div className="text-center">
        <LayoutButton
          onClick={() => setActive(1)}
          onMouseEnter={() => setActive(1)}
          active={active === 1}
          className="text-blue-brand bg-blue-900"
        >
          &lt;Root&gt;
        </LayoutButton>
        <LayoutButton
          onClick={() => setActive(2)}
          onMouseEnter={() => setActive(2)}
          active={active === 2}
          className="text-aqua-brand bg-aqua-900"
        >
          &lt;Sales&gt;
        </LayoutButton>
        <LayoutButton
          onClick={() => setActive(3)}
          onMouseEnter={() => setActive(3)}
          active={active === 3}
          className="text-yellow-brand bg-yellow-900"
        >
          &lt;Invoices&gt;
        </LayoutButton>
        <LayoutButton
          onClick={() => setActive(4)}
          onMouseEnter={() => setActive(4)}
          active={active === 4}
          className="text-red-brand bg-red-900"
        >
          &lt;Invoice id={"{id}"}&gt;
        </LayoutButton>
      </div>
      <div className="h-4" />

      <BrowserChrome
        url={
          {
            0: "example.com/sales/invoices/102000",
            1: (
              <span>
                <span className="text-blue-brand">example.com</span>
                /sales/invoices/102000
              </span>
            ),
            2: (
              <span>
                example.com/
                <span className="text-aqua-brand">sales</span>/invoices/102000
              </span>
            ),
            3: (
              <span>
                example.com/sales/
                <span className="text-yellow-brand">invoices</span>/102000
              </span>
            ),
            4: (
              <span>
                example.com/sales/invoices/
                <span className="text-red-brand">102000</span>
              </span>
            ),
          }[active || 0] as string
        }
      >
        <Fakebooks highlight={active === 1}>
          <Sales highlight={active === 2}>
            <Invoices highlight={active === 3}>
              <Invoice highlight={active === 4} />
            </Invoices>
          </Sales>
        </Fakebooks>
      </BrowserChrome>
    </>
  );
}

////////////////////////////////////////////////////////////////////////////////
function Fakebooks({
  children,
  highlight,
  className,
}: {
  children: React.ReactNode;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div
      className={
        "relative bg-white text-gray-600 flex rounded md:rounded-lg overflow-hidden" +
        " " +
        className
      }
    >
      <div className="bg-gray-50 border-r border-gray-100">
        <div className="p-[5.7px] md:p-4">
          <div className="flex items-center text-[color:#23BF1F]">
            <FakebooksLogo className="w-[8.5px] h-[8.5px] md:h-[18px] md:w-[18px] relative top-[1px]" />
            <div className="w-[1px] md:w-1" />
            <div className="font-display text-[length:8px] md:text-d-p-sm">
              Fakebooks
            </div>
          </div>
          <div className="h-2 md:h-7" />
          <div className="font-bold text-gray-800">
            <NavItem>Dashboard</NavItem>
            <NavItem>Accounts</NavItem>
            <NavItem className="bg-gray-100 rounded md:rounded-md">
              Sales
            </NavItem>
            <NavItem>Expenses</NavItem>
            <NavItem>Reports</NavItem>
          </div>
        </div>
      </div>
      <div className="flex-1">{children}</div>
      {highlight && (
        <Highlighter className="bg-blue-brand ring-blue-brand">
          <Resources className="bg-blue-900" data="/user.json" mod="/root.js" />
        </Highlighter>
      )}
    </div>
  );
}

function Highlighter({
  className,
  children,
}: {
  className: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        "bg-opacity-30 absolute inset-0 z-10 ring-2 md:ring-4 ring-inset rounded md:rounded-lg flex items-center justify-center" +
        " " +
        className
      }
    >
      {children}
    </div>
  );
}

function Resources({
  className,
  data,
  mod,
}: {
  className: string;
  data: string;
  mod: string;
}) {
  return (
    <div
      className={
        "font-mono p-2 bg-opacity-95 text-white rounded md:rounded-xl text-m-p-sm md:text-d-p-lg" +
        " " +
        className
      }
    >
      import("{mod}")
      <br />
      fetch("{data}")
    </div>
  );
}

function Sales({
  children,
  highlight,
  shimmerNav,
}: {
  children: React.ReactNode;
  highlight?: boolean;
  shimmerNav?: boolean;
}) {
  return (
    <div className="relative p-3 md:p-10">
      <div className="font-display text-[length:10px] md:text-d-h3 text-black">
        Sales
      </div>
      <div className="h-2 md:h-6" />
      <div className="flex gap-2 font-medium md:gap-4 text-gray-400 border-b border-gray-100 text-[length:5px] md:text-[length:14px] pb-1 md:pb-4">
        {shimmerNav ? (
          <>
            <div className="bg-gray-300 animate-pulse w-1/3 rounded">
              &nbsp;
            </div>
            <div className="bg-gray-300 animate-pulse w-1/3 rounded">
              &nbsp;
            </div>
            <div className="bg-gray-300 animate-pulse w-1/3 rounded">
              &nbsp;
            </div>
          </>
        ) : (
          <>
            <div>Overview</div>
            <div>Subscriptions</div>
            <div className="font-bold text-black">Invoices</div>
            <div>Customers</div>
            <div>Deposits</div>
          </>
        )}
      </div>
      <div className="h-3 md:h-4" />
      {children}
      {highlight && (
        <Highlighter className="bg-aqua-brand ring-aqua-brand">
          <Resources
            className="bg-aqua-900"
            data="/sales/nav.json"
            mod="/sales.js"
          />
        </Highlighter>
      )}
    </div>
  );
}

function InvoicesInfo({
  label,
  amount,
  right,
}: {
  label: string;
  amount: string;
  right?: boolean;
}) {
  return (
    <div className={right ? "text-right" : ""}>
      <LabelText>{label}</LabelText>
      <div className="text-black text-[length:6.4px] md:text-[length:18px]">
        {amount}
      </div>
    </div>
  );
}

function Invoices({
  children,
  highlight,
}: {
  children: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div className="relative">
      <div className="flex justify-between items-center gap-1 md:gap-4">
        <InvoicesInfo label="Overdue" amount="$10,800" />
        <div className="flex-1 h-[6px] md:h-4 flex rounded-full overflow-hidden">
          <div className="w-1/3 bg-yellow-brand" />
          <div className="flex-1 bg-green-brand" />
        </div>
        <InvoicesInfo label="Due Soon" amount="$62,000" right />
      </div>
      <div className="h-3 md:h-4" />
      <LabelText>Invoice List</LabelText>
      <div className="h-[2.8px] md:h-2" />
      <InvoiceList children={children} />
      {highlight && (
        <Highlighter className="bg-yellow-brand ring-yellow-brand -m-2">
          <Resources
            className="bg-yellow-900"
            data="/invoices.json"
            mod="/invoices.js"
          />
        </Highlighter>
      )}
    </div>
  );
}

let invoices = [
  {
    name: "Santa Monica",
    number: 1995,
    amount: "$10,800",
    due: -1,
  },
  {
    name: "Stankonia",
    number: 2000,
    amount: "$8,000",
    due: 0,
    active: true,
  },
  {
    name: "Ocean Avenue",
    number: 2003,
    amount: "$9,500",
    due: false,
  },
  {
    name: "Tubthumper",
    number: 1997,
    amount: "$14,000",
    due: 10,
  },
  {
    name: "Wide Open Sp...",
    number: 1998,
    amount: "$4,600",
    due: 8,
  },
];

function InvoiceList({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex rounded md:rounded-lg border border-gray-100">
      <div className="w-1/2 border-r border-gray-100">
        {invoices.map((invoice, index) => (
          <div
            key={index}
            className={
              "py-[4.2px] md:py-3 border-b border-gray-50" +
              " " +
              (index === 1
                ? "px-[5.7px] md:px-4 bg-gray-50"
                : "mx-[5.7px] md:mx-4 border-transparent")
            }
          >
            <div className="flex justify-between font-bold text-[length:5px] leading-[8.5px] md:text-[length:14px] md:leading-6">
              <div>{invoice.name}</div>
              <div>{invoice.amount}</div>
            </div>
            <div className="flex justify-between text-gray-400 font-medium text-[length:4.2px] leading-[6px] md:text-[length:12px] md:leading-4">
              <div>{invoice.number}</div>
              <div
                className={
                  "uppercase" +
                  " " +
                  (invoice.due === false
                    ? "text-green-brand"
                    : invoice.due < 0
                    ? "text-red-brand"
                    : "")
                }
              >
                {getInvoiceDue(invoice)}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="w-1/2">{children}</div>
    </div>
  );
}

let getInvoiceDue = (invoice: typeof invoices[number]) =>
  invoice.due === false
    ? "Paid"
    : invoice.due < 0
    ? "Overdue"
    : invoice.due === 0
    ? "Due Today"
    : `Due in ${invoice.due} Days`;

function Invoice({ highlight }: { highlight?: boolean }) {
  let invoice = invoices[1];
  return (
    <div className="relative p-3 md:p-10">
      <div className="font-bold text-[length:5px] leading-[8.5px] md:text-[length:14px] md:leading-6">
        {invoice.name}
      </div>
      <div className="font-bold text-[length:11px] leading-[14px] md:text-[length:32px] md:leading-[40px]">
        {invoice.amount}
      </div>
      <LabelText>{getInvoiceDue(invoice)} • Invoiced 10/31/2000</LabelText>
      <div className="h-[5.7px] md:h-4" />
      <LineItem label="Pro Plan" amount="$6,000" />
      <LineItem label="Custom" amount="$2,000" />
      <LineItem bold label="Net Total" amount="$8,000" />
      {highlight && (
        <Highlighter className="bg-red-brand ring-red-brand">
          <Resources
            className="bg-red-900 absolute right-2 bottom-2 sm:static"
            data="/invoice/{id}.json"
            mod="/invoice.js"
          />
        </Highlighter>
      )}
    </div>
  );
}

function LineItem({
  label,
  amount,
  bold,
}: {
  label: string;
  amount: string;
  bold?: boolean;
}) {
  return (
    <div
      className={
        "flex justify-between border-t border-gray-100 text-[5px] leading-[9px] md:text-[14px] md:leading-[24px] py-[5.7px] md:py-4" +
        " " +
        (bold ? "font-bold" : "")
      }
    >
      <div>{label}</div>
      <div>{amount}</div>
    </div>
  );
}

function LabelText({ children }: { children: React.ReactNode }) {
  return (
    <div className="uppercase text-gray-400 font-medium text-[length:5px] leading-[8.5px] md:text-[12px] md:leading-[24px]">
      {children}
    </div>
  );
}

function NavItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`text-[length:7px] md:text-[length:14px] py-[1.4px] px-[2.8px] md:py-1 md:px-2 my-[1.4px] md:my-1 pr-4 md:pr-16 ${className}`}
    >
      {children}
    </div>
  );
}

function FakebooksLogo({ className }: { className: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        fill="#23BF1F"
        fillRule="evenodd"
        d="M12 3a9 9 0 000 18h4.5c1.398 0 2.097 0 2.648-.228a3 3 0 001.624-1.624C21 18.597 21 17.898 21 16.5V12a9 9 0 00-9-9zm-4 8a1 1 0 011-1h6a1 1 0 110 2H9a1 1 0 01-1-1zm3 4a1 1 0 011-1h3a1 1 0 110 2h-3a1 1 0 01-1-1z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
}

function BrowserChrome({
  url,
  children,
}: {
  url: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative mx-2 md:mx-4 lg:mx-auto lg:max-w-4xl  bg-gray-700 shadow-md rounded md:rounded-lg">
      <URLBar url={url} />
      <div className="px-2 pt-1 pb-2 md:px-4 md:pt-2 md:pb-4">{children}</div>
    </div>
  );
}

function URLBar({ url }: { url: string }) {
  return (
    <div className="flex px-1 pt-1 pb-0 md:px-2 md:pt-2 items-center justify-center">
      <div className="flex items-center w-2/3 rounded-md py-1 px-2 md:py-1 md:px-3 relative bg-gray-600 text-gray-100">
        <span className="text-[length:10px] md:text-m-p-sm">{url}</span>
        <Refresh className="absolute right-1 w-4 h-4 md:h-5 md:w-5" />
      </div>
      <div className="absolute left-1 md:left-2 flex p-2 gap-1 md:gap-2">
        <Circle />
        <Circle />
        <Circle />
      </div>
    </div>
  );
}

function Circle() {
  return <div className="bg-gray-400 rounded-full w-2 h-2 md:h-3 md:w-3" />;
}

function Refresh({ className }: { className: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 7 7"
    >
      <path
        fill="#fff"
        fillOpacity="0.8"
        d="M5.088 4.004l-.125.126.125.125.126-.125-.126-.126zm-1.073-.822l.948.948.251-.252-.948-.948-.251.252zm1.2.948l.947-.948-.251-.252-.948.948.251.252z"
      ></path>
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeOpacity="0.8"
        strokeWidth="0.355"
        d="M4.26 4.966a1.659 1.659 0 11.829-1.436"
      ></path>
    </svg>
  );
}
