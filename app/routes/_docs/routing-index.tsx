import {
  BrowserChrome,
  Fakebooks,
  Sales,
} from "~/components/scroll-experience";

export let handle = { forceDark: true };

export default function () {
  return (
    <div className="pt-8">
      <BrowserChrome url="example.com/sales">
        <Fakebooks>
          <Sales noActiveChild>
            <div className="h-72" />
          </Sales>
        </Fakebooks>
      </BrowserChrome>
    </div>
  );
}
