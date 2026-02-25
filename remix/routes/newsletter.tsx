import cx from "clsx";
import { Document } from "../components/document";
import { Footer } from "../components/home/footer";
import { Header } from "../components/home/header";
import { NewsletterSubscribeForm } from "../assets/newsletter-subscribe";
import { render } from "../utils/render";
import { CACHE_CONTROL } from "../../shared/cache-control";

export async function newsletterHandler() {
  return render.document(<Page />, {
    headers: {
      "Cache-Control": CACHE_CONTROL.DEFAULT,
    },
  });
}

function Page() {
  return () => (
    <Document
      title="Remix Newsletter"
      description="Stay up-to-date with news, announcements, and releases for our projects like Remix and React Router. We respect your privacy, unsubscribe at any time."
      forceTheme="dark"
    >
      <Header />
      <main class="flex flex-1 flex-col" tabIndex={-1}>
        <NewsletterPageContent />
      </main>
      <Footer />
    </Document>
  );
}

function NewsletterPageContent() {
  return () => (
    <div
      class={cx("container flex flex-1 flex-col justify-center md:max-w-2xl")}
    >
      <div>
        <div class="h-8" />
        <div class="text-3xl font-extrabold text-white">Newsletter</div>
        <div class="h-6" />
        <div class="text-lg" id="newsletter-text">
          Stay up-to-date with news, announcements, and releases for our
          projects like Remix and React Router. We respect your privacy,
          unsubscribe at any time.
        </div>
        <div class="h-9" />
        <NewsletterSubscribeForm
          class={cx("sm:flex sm:gap-2")}
          inputClass={cx(
            "w-full sm:w-auto sm:flex-1 dark:placeholder-gray-500",
            "box-border appearance-none rounded border px-4 py-2",
          )}
          buttonClass={cx(
            "w-full mt-2 sm:w-auto sm:mt-0 uppercase",
            "rounded border bg-white px-4 py-2 font-semibold text-gray-900",
            "hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white",
          )}
        />
      </div>
    </div>
  );
}
