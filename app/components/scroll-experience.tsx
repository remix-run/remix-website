import { ReactNode } from "react";

export function ScrollExperience() {
  return (
    <div>
      <Intro />
      <div className="h-60" />
      <NestedRoutes />
      <div className="h-96" />
      <BrowserChrome url="https://example.com/sales/invoices/102000">
        <Fakebooks />
      </BrowserChrome>
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
function Fakebooks() {
  return (
    <div className="bg-white text-gray-600 rounded md:rounded-lg overflow-hidden flex min-h-full">
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
      <div className="flex-1">
        <Sales />
      </div>
    </div>
  );
}

function Sales() {
  return (
    <div className="p-3 md:p-10">
      <div className="font-display text-[length:10px] md:text-d-h3 text-black">
        Sales
      </div>
      <div className="h-2 md:h-6" />
      <div className="flex gap-2 font-medium md:gap-4 text-gray-400 border-b border-gray-100 text-[length:5px] md:text-[length:14px] pb-1 md:pb-4">
        <div>Overview</div>
        <div>Subscriptions</div>
        <div className="font-bold text-black">Invoices</div>
        <div>Customers</div>
        <div>Deposits</div>
      </div>
      <div className="h-3 md:h-4" />
      <Invoices />
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

function Invoices() {
  return (
    <div>
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
      <InvoiceList />
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

function InvoiceList() {
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
      <div className="w-1/2">
        <Invoice />
      </div>
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

function Invoice() {
  let invoice = invoices[1];
  return (
    <div className="p-3 md:p-10">
      <div className="font-bold text-[length:5px] leading-[8.5px] md:text-[length:14px] md:leading-6">
        {invoice.name}
      </div>
      <div className="font-bold text-[length:11px] leading-[14px] md:text-[length:32px] md:leading-[40px]">
        {invoice.amount}
      </div>
      <LabelText>{getInvoiceDue(invoice)} • Invoiced 10/31/2000</LabelText>
      <div className="h-[5.7px] md:h-4" />
      <LineItem label="Pro Plan" amount="$6,000" />
      <LineItem label="Customization" amount="$2,000" />
      <LineItem bold label="Net Total" amount="$8,000" />
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

function LabelText({ children }: { children: ReactNode }) {
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
  children: ReactNode;
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
    <div className="relative mx-2 md:mx-4 lg:mx-auto lg:max-w-4xl  bg-gray-700 rounded-lg">
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
