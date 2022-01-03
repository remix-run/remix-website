export default function PodcastIndex() {
  return (
    <div>
      <div className="h-8" />
      <div className="font-display text-m-h1 text-white">The Remix Podcast</div>
      <div className="h-6" />
      <div className="text-m-p-lg">
        On this upcoming podcast, we talk with people who have ideas on how you
        can improve the user experience of whatever you're building for the web.
        Subscribe today and you'll get the latest episodes when the show starts
        soon!
      </div>
      <div className="h-9" />
      <div>
        {"👉 "}
        <a
          className="underline"
          href="https://feeds.transistor.fm/the-remix-podcast"
          rel="nofollow"
          target="_blank"
        >
          feeds.transistor.fm/the-remix-podcast
        </a>
        {" 👈"}
      </div>
    </div>
  );
}
