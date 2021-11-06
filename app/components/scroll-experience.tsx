export function ScrollExperience() {
  return (
    <div>
      <Intro />
      <div className="h-60" />
      <NestedRoutes />
      <div className="h-96" />
      <Fastbooks url="https://example.com/sales/invoices/102000" />
      <div className="h-96" />
    </div>
  );
}

function Intro() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="text-m-j font-display text-white md:text-d-j">
        While you were <span className="text-red-brand">waiting</span> for your
        front-end build to finish,{" "}
        <span className="text-blue-brand">distributed web</span> infrastructure
        got really good. <span className="text-aqua-brand">Break through</span>{" "}
        the static.
      </div>
      <p className="text-m-p-lg md:text-d-p-lg mt-2 md:pr-52">
        Remix automatically provides snappy page loads and instant transitions
        without relying on static builds, but distributed systems. Performance
        isn't really our goal–UX is. As you've pushed the boundaries of the web,
        your tools haven't caught up to your appetite.{" "}
        <span className="text-white font-bold">Remix is ready</span> to serve
        you. Check it out 👀
      </p>
    </div>
  );
}

function NestedRoutes() {
  return (
    <div className="p-6">
      <div className="text-m-j md:text-d-h2 font-display text-center text-white">
        Nested Routes
      </div>
      <div className="h-2" />
      <p className="text-m-p-lg text-center max-w-xl mx-auto md:text-d-p-lg">
        Nearly every feature of Remix takes advantage of the unique insight
        gained from Nested Routes. To understand Remix, you need to understand
        nested routes.
      </p>
    </div>
  );
}

////////////////////////////////////////////////////////////////////////////////
function Fastbooks({ url }: { url: string }) {
  return (
    <div className="relative mx-4 h-[10rem] max-w-sm bg-gray-800 rounded-lg">
      <div className="flex p-1 items-center justify-center">
        <div className="flex w-2/3 rounded-md py-1 px-2 relative bg-gray-700 text-gray-200 text-[length:8px]">
          <span>{url}</span>
          <Refresh className="w-3 h-3 absolute right-1" />
        </div>
        <div className="absolute left-0 flex p-2 gap-1">
          <Circle />
          <Circle />
          <Circle />
        </div>
      </div>
    </div>
  );
}

function Circle() {
  return <div className="bg-gray-400 rounded-full w-1 h-1" />;
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
