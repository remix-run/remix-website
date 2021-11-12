import * as React from "react";
import { ScrollStage, Actor, useStage, useActor } from "./stage";
// @ts-expect-error
import { easeOutQuad, easeInExpo, linear } from "tween-functions";
import { Sequence, Slide } from "@ryanflorence/mdtut";

export function ScrollExperience({
  markdown,
}: {
  markdown: { mutations: Sequence };
}) {
  return (
    <div>
      <img src="/wave.png" className="absolute -left-full" />
      <img src="/loading.gif" className="absolute -left-full" />
      <Intro />
      <div className="h-60" />
      <NestedRoutes />
      <div className="h-[25vh]" />
      <Waterfall />
      <div className="h-[25vh]" />
      <Spinnageddon />
      <Prefetching />
      <div className="h-[75vh]" />
      <Mutations slides={markdown.mutations} />
      <div className="h-[100vh]" />
    </div>
  );
}

function Mutations({ slides }: { slides: Sequence }) {
  return (
    <>
      <div className="p-6 md:p-10 max-w-5xl mx-auto">
        <div className="text-m-j font-display text-white md:text-d-j">
          Data loading ...{" "}
          <img src="/yawn.png" className="h-8 md:h-14 inline" /> You ever notice
          most of the code in your app is for{" "}
          <span className="text-yellow-brand">changing data?</span>
        </div>
        <p className="text-m-p-lg md:text-d-p-lg mt-2 md:pr-52 lg:pr-72 hyphen-manual">
          Imagine if React only had props and no way to set state. What's the
          point? If a web framework helps you load data but doesn't help you
          write it, also, what's the point?! Remix doesn't drop you off at the{" "}
          <code>&lt;form onSubmit&gt;</code> cliff.{" "}
          <span className="text-gray-600">
            (what the heck is <code>event.preventDefault</code> for anyway?)
          </span>
        </p>
      </div>
      <div className="h-[25vh]" />
      <JumboText>
        Resilient, progressively enhanced{" "}
        <span className="text-blue-brand">data updates</span> are built in.
      </JumboText>
      <div className="h-[25vh]" />
      <MutationSlides sequence={slides} />
    </>
  );
}

function MutationSlides({ sequence }: { sequence: Sequence }) {
  let slideLength = 1 / 6;
  return (
    <ScrollStage pages={5.5}>
      <div className="xl:flex">
        <div className="p-max-w-lg flex-1 xl:mx-auto">
          <div className="xl:h-[12vh]" />
          <MutationP>
            It’s so simple it's kind of silly. Just make a form...
          </MutationP>
          <MutationP>
            ...and an action on the server. It's just a form so it even works
            w/o JavaScript.
          </MutationP>
          <MutationP>
            Remix runs the action server side, revalidates data client side, and
            even handles race conditions from resubmissions.
          </MutationP>
          <MutationP>
            Get fancy with transition hooks and make some pending UI. Remix
            handles all the state, you simply ask for it.
          </MutationP>
          <MutationP>
            Or get jiggy with some optimistic UI. Remix provides the data being
            sent to the server so you can skip the busy spinners for mutations,
            too.
          </MutationP>
          <MutationP>HTML Forms. Who knew?</MutationP>
        </div>

        <div className="bg-gray-800 sticky bottom-0 xl:bottom-auto xl:top-0 xl:flex-1 xl:self-start xl:h-screen xl:flex xl:items-center">
          <MutationCode
            start={0}
            end={slideLength * 1.5}
            slide={sequence.slides[0]}
          />
          <MutationCode
            start={slideLength * 1.5}
            end={slideLength * 2.5}
            slide={sequence.slides[1]}
          />
          <Actor start={slideLength * 2.5} end={slideLength * 3.2}>
            <MutationNetwork />
          </Actor>
          <MutationCode
            start={slideLength * 3.2}
            end={0.66}
            slide={sequence.slides[2]}
          />
          <MutationCode start={0.66} end={2} slide={sequence.slides[3]} />
        </div>
      </div>
    </ScrollStage>
  );
}

function MutationNetwork() {
  return (
    <div className="h-[50vh] flex justify-center items-center xl:w-full">
      <div className="w-4/5 pb-10">
        <Network>
          <Resource name="POST new" start={0} size={40} />
          <Resource
            name="GET invoices"
            start={40}
            size={10}
            cancel
            hideUntilStart
          />
          <Resource
            name="GET 102000"
            start={40}
            size={10}
            cancel
            hideUntilStart
          />
          <Resource name="POST new" start={50} size={20} hideUntilStart />
          <Resource name="GET invoices" start={70} size={20} hideUntilStart />
          <Resource name="GET 102000" start={70} size={15} hideUntilStart />
        </Network>
      </div>
    </div>
  );
}

function MutationCode({
  slide,
  start,
  end,
  persistent,
}: {
  slide: Slide;
  start: number;
  end: number;
  persistent?: boolean;
}) {
  return (
    <Actor start={start} end={end} persistent={persistent}>
      <div
        className="__mutation_code xl:w-full text-m-p-sm sm:text-d-p-sm md:text-m-p-lg"
        dangerouslySetInnerHTML={{ __html: slide.subject }}
      />
    </Actor>
  );
}

function MutationP({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 sm:px-8 max-w-2xl text-m-j md:text-d-j text-gray-100 font-display h-[75vh] flex items-center">
      <div>{children}</div>
    </div>
  );
}

function JumboP({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-6 text-m-j md:text-d-j text-gray-100 md:max-w-3xl font-display md:mx-auto my-[20vh]">
      {children}
    </div>
  );
}

function Prefetching() {
  return (
    <div>
      <JumboText>
        Nested routes allow Remix to make your app{" "}
        <span className="text-red-brand">as fast as instant.</span>
      </JumboText>
      <div className="h-[10vh]" />

      <ScrollStage pages={2}>
        <div className="h-[15vh]" />
        <JumboP>
          Remix can prefetch everything in parallel before the user clicks a
          link.
        </JumboP>
        <JumboP>Public Data. User Data. Modules. Heck, even CSS.</JumboP>
        <JumboP>Zero loading states. Zero skeleton UI. Zero jank.</JumboP>
        <JumboP>
          <span className="text-gray-500">
            Alright, you caught us, they're just prefetch link tags,
            #useThePlatform
          </span>
        </JumboP>
        <div className="sticky bottom-[-5vh]">
          <PrefetchBrowser />
        </div>
      </ScrollStage>
    </div>
  );
}

let moveStart = 0.65;
let hoverStart = 0.68;
let clickAt = 0.9;

function PrefetchBrowser() {
  return (
    <BrowserChrome url="example.com/dashboard">
      <Fakebooks className="h-[35vh] md:h-[45vh]">
        <Actor start={0} end={moveStart}>
          <Dashboard />
        </Actor>
        <Actor start={moveStart} end={clickAt}>
          <Dashboard highlightOnHover />
        </Actor>
        <Actor start={clickAt}>
          <Sales>
            <Invoices>
              <Invoice />
            </Invoices>
          </Sales>
        </Actor>
      </Fakebooks>

      <Actor start={moveStart} end={clickAt - 0.2} persistent>
        <Cursor />
      </Actor>

      <Actor start={hoverStart} end={clickAt - 0.05}>
        <PrefetchNetwork />
      </Actor>
    </BrowserChrome>
  );
}

function PrefetchNetwork() {
  return (
    <div className="absolute top-[35%] left-[34%] w-[50%] p-2 bg-gray-800 rounded drop-shadow-md">
      <Network ticks={25}>
        <Resource name="sales.js" start={0} size={44} />
        <Resource name="sales/nav.json" start={0} size={42} />
        <Resource name="invoices.js" start={0} size={40} />
        <Resource name="invoice.js" start={0} size={84} />
        <Resource name="invoice/{id}.json" start={0} size={48} />
        <Resource name="invoice.css" start={0} size={10} />
      </Network>
    </div>
  );
}

function WaterfallHeader({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-display text-d-p-lg lg:text-d-h3 font-bold text-white text-center mb-2 lg:mb-6">
      {children}
    </div>
  );
}

function WaterfallComparison() {
  return (
    <ScrollStage pages={4}>
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center pb-4 xl:pb-56">
        <div className="xl:flex">
          <div className="relative xl:-right-10">
            <WaterfallHeader>Without Remix</WaterfallHeader>
            <WaterfallBrowser>
              <WithoutRemix />
            </WaterfallBrowser>
          </div>

          <div className="relative xl:-left-10">
            <WaterfallHeader>With Remix</WaterfallHeader>
            <WaterfallBrowser>
              <WithRemix />
            </WaterfallBrowser>
          </div>
        </div>
      </div>
    </ScrollStage>
  );
}

function WaterfallBrowser({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Actor start={0.26} end={0.95} persistent>
      <div
        className={
          "scale-75 origin-top sm:scale-50 xl:scale-75 xl:w-[50vw] -mb-14 sm:mb-[-18rem]" +
          " " +
          className
        }
      >
        {children}
      </div>
    </Actor>
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
    ["sales/nav.json", 56, 8],
    ["invoices.js", 56, 10],
    ["invoice.js", 66, 22],
    ["invoice/{id}.json", 88, 12],
  ];

  let jank: [number, React.ReactNode][] = [
    [10, <JankSpinner className="p-8 sm:p-20" />],
    [
      35,
      <Fakebooks className="h-[25vh] sm:h-[38vh]">
        <JankSpinner className="p-12 sm:p-24" />
      </Fakebooks>,
    ],
    [
      56,
      <Fakebooks className="h-[25vh] sm:h-[38vh]">
        <Sales shimmerNav>
          <div className="h-[6rem]">
            <JankSpinner className="p-8" />
          </div>
        </Sales>
      </Fakebooks>,
    ],
    [
      64,
      <Fakebooks className="h-[25vh] sm:h-[38vh]">
        <Sales>
          <div className="h-[6rem]">
            <JankSpinner className="p-8" />
          </div>
        </Sales>
      </Fakebooks>,
    ],
    [
      66,
      <Fakebooks className="h-[25vh] sm:h-[38vh]">
        <Sales>
          <Invoices>
            <JankSpinner className="p-10" />
          </Invoices>
        </Sales>
      </Fakebooks>,
    ],
    [
      100,
      <Fakebooks className="h-[25vh] sm:h-[38vh]">
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
      <div className="h-[25vh] sm:h-[38vh] bg-white">{screen}</div>
      <div className="h-4" />
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
      {progress < 30 ? (
        <div className="bg-white h-[25vh] sm:h-[38vh]" />
      ) : (
        <Fakebooks className="h-[25vh] sm:h-[38vh]">
          <Sales>
            <Invoices>
              <Invoice />
            </Invoices>
          </Sales>
        </Fakebooks>
      )}
      <div className="h-4" />
      <Network>
        <Resource name="document" start={0} size={30} />
        <Resource name="root.js" start={30} size={30} />
        <Resource name="sales.js" start={30} size={21} />
        <Resource name="invoices.js" start={30} size={8} />
        <Resource name="invoice.js" start={30} size={10} />
        <Resource name="&nbsp;" start={0} size={0} />
        <Resource name="&nbsp;" start={0} size={0} />
        <Resource name="&nbsp;" start={0} size={0} />
      </Network>
    </BrowserChrome>
  );
}

function Network({
  children,
  ticks = 50,
}: {
  children: React.ReactNode;
  ticks?: number;
}) {
  let actor = useActor();
  return (
    <div className="relative">
      <Ticks n={ticks} />
      <div className="h-4" />
      <div>{children}</div>
      <div className="absolute left-16 sm:left-28 top-0 right-0 h-full">
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
  cancel,
  hideUntilStart,
}: {
  name: string;
  size: number;
  start: number;
  cancel?: boolean;
  hideUntilStart?: boolean;
}) {
  let actor = useActor();
  let progress = actor.progress * 100;
  let end = start + size;

  let complete = progress > end;
  let width = complete ? size : Math.max(progress - start, 0);

  return (
    <div className="flex items-center justify-center border-b border-gray-600 last:border-b-0">
      <div
        className={
          "w-16 sm:w-28 text-[length:8px] sm:text-m-p-sm" +
          " " +
          (width === 0 ? "opacity-0" : "")
        }
      >
        {name}
      </div>
      <div className="flex-1 relative">
        <div
          className={
            "h-1 sm:h-2" +
            " " +
            (complete
              ? cancel
                ? "bg-red-brand"
                : "bg-green-brand"
              : "bg-blue-brand")
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

function Ticks({ n }: { n: number }) {
  let ticks = Array.from({ length: n }).fill(null);
  return (
    <div className="absolute top-0 left-16 sm:left-28 right-0 flex justify-around">
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
      <p className="text-m-p-lg md:text-d-p-lg mt-2 md:pr-52 lg:pr-72 hyphen-manual">
        Remix provides snappy page loads and instant transitions by leveraging
        distributed systems instead of static builds. However, page speed is
        only one aspect of our true goal: <Em>better user experiences</Em>. As
        you've pushed the boundaries of the web, your tools haven't caught up to
        your appetite. <Em>Remix is ready</Em> to serve you from the initial
        request to the fanciest UX your designers can think up. Check it out 👀
      </p>
    </div>
  );
}

function P1({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={
        "px-6 text-m-p-lg md:text-d-p-lg md:px-10 md:max-w-2xl md:mx-auto md:text-center" +
        " " +
        className
      }
    >
      {children}
    </p>
  );
}

function P2({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={
        "px-6 mb-10 text-m-p-lg md:text-d-p-lg md:text-center max-w-3xl mx-auto" +
        " " +
        className
      }
    >
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

function JumboText({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[length:48px] leading-[48px] md:text-[length:96px] md:leading-[96px] font-display text-white max-w-6xl mx-auto px-6 md:px-12">
      {children}
    </div>
  );
}

function Waterfall() {
  return (
    <>
      <JumboText>
        Through nested routes, Remix can eliminate nearly{" "}
        <span className="text-green-brand">every loading state.</span>
      </JumboText>
      <div className="h-[10vh]" />
      <JumboP>
        Most web apps fetch inside of components, creating{" "}
        <span className="text-aqua-brand">request waterfalls</span>, slower
        loads, and <span className="text-red-brand">jank.</span>
      </JumboP>
      <JumboP>
        Remix loads data in parallel on the server and sends a fully formed HTML
        document.{" "}
        <span className="text-pink-brand">Way faster, jank free.</span>
      </JumboP>
      <WaterfallComparison />
    </>
  );
}

function NestedRoutes() {
  return (
    <>
      <JumboText>
        Remix has a cheat code
        <br />
        <span className="text-yellow-brand">Nested Routes.</span>
        <br />
        <span className="font-mono text-gray-800">↑↑↓↓←→←→BA</span>
      </JumboText>
      <div className="h-[25vh]" />
      <div>
        <JumboP>
          Websites usually have levels of navigation that control child views.
        </JumboP>
        <JumboP>
          Not only are these components pretty much always coupled to URL
          segments...
        </JumboP>
        <JumboP>
          ...they're also the semantic boundary of data loading and code
          splitting.
        </JumboP>
        <JumboP>Hover or tap the buttons to see how they're all related</JumboP>
        <InteractiveRoutes />
      </div>
    </>
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

let SPINNER_END = 0.8;

function Spinner({ className, start }: { className: string; start: number }) {
  return (
    <>
      <Actor start={start} end={SPINNER_END}>
        <img src="/loading.gif" className={className} />
      </Actor>
      <Actor start={SPINNER_END} end={1}>
        <Wave className={className} />
      </Actor>
    </>
  );
}

function Wave({ className }: { className: string }) {
  let actor = useActor();
  let opacity = easeInExpo(actor.progress, 1, 0, 1);
  return (
    <img
      src="/wave.png"
      style={{ opacity, transform: `scale(${opacity})` }}
      className={className}
    />
  );
}

function SayGoodbyeGreen() {
  let stage = useStage();
  return (
    <div
      className={
        `sticky top-0 h-screen flex w-screen items-center justify-center text-center font-display text-[length:48px] leading-[48px] sm:text-[length:65px] sm:leading-[65px] md:text-[length:80px] md:leading-[80px] lg:text-[length:100px] lg:leading-[100px] xl:text-[length:140px] xl:leading-[140px] text-white` +
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
      <div
        className={
          "text-m-j md:text-d-j text-center pb-2" +
          " " +
          (active === 0 ? "animate-bounce" : "")
        }
      >
        👇
      </div>
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

      <div className="sticky bottom-0 md:bottom-[-15vh]">
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
      </div>
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
        <div className="p-[5.7px] lg:p-4">
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

function Dashboard({ highlightOnHover }: { highlightOnHover?: boolean }) {
  let stage = useStage();
  return (
    <div className="relative p-3 md:p-6">
      <div className="font-display text-[length:10px] md:text-d-h3 text-black">
        Dashboard
      </div>
      <div className="h-2 md:h-6" />
      <div className="flex gap-2 font-medium md:gap-4 text-gray-400 border-b border-gray-100 text-[length:5px] md:text-[length:14px] pb-1 md:pb-4">
        <div className="font-bold text-black">Recent Activity</div>
        <div>Alerts</div>
        <div>Messages</div>
      </div>
      <div className="h-3 md:h-4" />
      <div className="flex gap-2">
        <ActivityCard
          title="New Invoice"
          invoice={invoices[1]}
          hovered={highlightOnHover && stage.progress > hoverStart}
        />
        <ActivityCard title="New Invoice" invoice={invoices[2]} />
      </div>
    </div>
  );
}

function Cursor() {
  let stage = useStage();
  let actor = useActor();
  let left = easeOutQuad(actor.progress, 5, 28, 1);
  let top = easeOutQuad(actor.progress, 10, 40, 1);
  let cursor = stage.progress < hoverStart ? <DefaultCursor /> : <Pointer />;
  let clickOffset = 0.02;
  let click =
    stage.progress >= clickAt - clickOffset &&
    stage.progress < clickAt + clickOffset;
  let clickScale = linear(
    stage.progress - clickAt + clickOffset,
    0,
    2,
    clickOffset * 2
  );

  return (
    <div>
      <div
        className="absolute"
        style={{
          top: top + "%",
          left: left + "%",
        }}
      >
        {cursor}
        {click && (
          <div
            style={{
              transform: `scale(${clickScale})`,
            }}
            className="absolute -top-2 -left-2 h-4 w-4 bg-red-brand rounded-full opacity-50"
          />
        )}
      </div>
    </div>
  );
}

function Pointer() {
  return (
    <svg
      className="w-7 relative -left-2"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 28 32"
    >
      <path
        fill="#fff"
        stroke="#000"
        strokeWidth="2"
        d="M5.854 25.784l-4.69-9.602a1.634 1.634 0 01.729-2.167h0c.538-.277 1.002-.218 1.512.103.567.355 1.133 1.014 1.653 1.83.509.8.92 1.667 1.207 2.344a18.84 18.84 0 01.426 1.104l.004.013v.002h.003l1.948-.313V2.552c0-.868.692-1.552 1.522-1.552.83 0 1.522.684 1.522 1.552v0l.006 8.252v0h2s0 0 0 0c0-.872.774-1.637 1.6-1.637.872 0 1.606.726 1.606 1.552v2.552h2c0-.868.692-1.552 1.522-1.552.83 0 1.522.684 1.522 1.552v2.807h2c0-.868.693-1.552 1.522-1.552.83 0 1.522.684 1.522 1.552V17.471h.006L27 23.492s0 0 0 0C27 27.66 23.715 31 19.644 31h-6.726c-2.13 0-3.875-1.217-5.148-2.57a13.227 13.227 0 01-1.806-2.444 7.264 7.264 0 01-.108-.198l-.002-.004z"
      ></path>
    </svg>
  );
}

function DefaultCursor() {
  return (
    <svg
      className="w-7"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 23 32"
    >
      <path
        fill="#fff"
        stroke="#000"
        strokeWidth="2"
        d="M8.214 22.016L1 30.43V1.47l20.197 20.196H8.512l-.299.349z"
      ></path>
    </svg>
  );
}

function ActivityCard({
  invoice,
  hovered,
}: {
  title: string;
  invoice: typeof invoices[number];
  hovered?: boolean;
}) {
  return (
    <div
      className={
        "p-2 box-border flex-1 md:p-10 border rounded-lg border-gray-50" +
        " " +
        (hovered ? "bg-gray-50" : "")
      }
    >
      <div className="text-center font-bold text-[length:5px] leading-[8.5px] md:text-[length:14px] md:leading-6">
        New Invoice
      </div>
      <div className="h-[5.7px] md:h-4" />
      <LineItem label="Customer" amount={invoice.name} />
      <LineItem label="Net Total" amount={invoice.amount} />
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
      className={`text-[length:7px] md:text-[length:10px] lg:text-[length:14px] py-[1.4px] px-[2.8px] md:py-1 md:px-2 my-[1.4px] md:my-1 pr-4 md:pr-16 ${className}`}
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
