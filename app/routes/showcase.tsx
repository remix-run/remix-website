import { Footer } from "~/ui/footer";
import { Header } from "~/ui/header";

export default function Showcase() {
  return (
    <div className="flex h-full flex-1 flex-col">
      <Header />
      <main
        className="container mt-16 flex flex-1 flex-col lg:mt-32"
        tabIndex={-1} // is this every gonna be focused? just copy pasta
      >
        <div className="text-center">
          <h1 className="text-4xl font-bold lg:text-6xl">Remix Showcase</h1>
          <p className="mt-4 text-lg font-light">
            Some quippy comment about how we're really great
          </p>
        </div>
        <ul className="mt-8 grid w-full max-w-md grid-cols-1 gap-x-8 gap-y-6 self-center md:max-w-3xl md:grid-cols-2 lg:max-w-5xl lg:grid-cols-3">
          {/* <ul className="mt-16 grid max-w-[26rem] grid-cols-1 gap-6 px-4 sm:mt-20 sm:max-w-[52.5rem] sm:grid-cols-2 sm:px-6 md:mt-32 lg:max-w-7xl lg:grid-cols-3 lg:gap-y-8 lg:px-8 xl:gap-x-8"> */}
          {Array.from({ length: 6 }).map((_, i) => (
            <ShowcaseCard key={i} />
          ))}
        </ul>
      </main>
      <Footer />
    </div>
  );
}

function ShowcaseCard() {
  return <li className="h-80 border border-gray-800" />;
}
