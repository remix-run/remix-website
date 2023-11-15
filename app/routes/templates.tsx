import { Header } from "~/ui/header";
import { Footer } from "~/ui/footer";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { templates } from "~/lib/template.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  return json({ templates });
};

export default function Templates() {
  const { templates } = useLoaderData<typeof loader>();

  let { name, description, imgSrc, repoUrl, stars, initCommand, sponsorUrl } =
    templates[2];

  return (
    <div className="flex h-full flex-1 flex-col">
      <Header />
      <InitCodeblock code={initCommand} />

      <main
        className="container mt-16 flex flex-1 flex-col items-center lg:mt-32"
        tabIndex={-1} // is this every gonna be focused? just copy pasta
      >
        <div>
          <img src={imgSrc} alt="" />
          <h2>{name}</h2>
          <p>{description}</p>
          <code>{initCommand}</code>
          <InitCodeblock code={initCommand} />
          <a href={repoUrl}>Repo</a>
          <p className="flex gap-x-1 items-center">
            <svg
              aria-hidden="true"
              height="16"
              viewBox="0 0 16 16"
              data-view-component="true"
              className="w-4 h-4"
              fill="#eac54f"
            >
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
            </svg>
            <span>{stars}</span>
          </p>
          {sponsorUrl ? (
            <a className="flex gap-x-1 items-center" href={sponsorUrl}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
                className="w-4"
                fill="#b14587"
              >
                <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002ZM4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.58 20.58 0 0 0 8 13.393a20.58 20.58 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z"></path>
              </svg>
              <span>Sponsor</span>
            </a>
          ) : null}

          <Container>
            <a href={repoUrl} className="group text-sm">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                <img
                  src={imgSrc}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <h2 className="mt-4 font-medium text-gray-900">{name}</h2>
              <p className="italic text-gray-500">{description}</p>
            </a>
          </Container>
          <Container>
            <a href={repoUrl} className="group text-sm flex col-span-3">
              <div className="aspect-h-1 aspect-w-3 w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
                <img
                  src={imgSrc}
                  alt=""
                  className="h-full w-full object-cover object-center"
                />
              </div>
              <div>
                <h2 className="mt-4 font-medium text-gray-900">{name}</h2>
                <p className="italic text-gray-500">{description}</p>
              </div>
            </a>
          </Container>
          <Container>
            <ProductExamples />
          </Container>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Container({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-7xl overflow-hidden px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
        {children}
      </div>
    </div>
  );
}

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/aspect-ratio'),
    ],
  }
  ```
*/
const products = [
  {
    id: 1,
    name: "Nomad Pouch",
    href: "#",
    price: "$50",
    availability: "White and Black",
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/category-page-07-product-01.jpg",
    imageAlt:
      "White fabric pouch with white zipper, black zipper pull, and black elastic loop.",
  },
  {
    id: 2,
    name: "Zip Tote Basket",
    href: "#",
    price: "$140",
    availability: "Washed Black",
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/category-page-07-product-02.jpg",
    imageAlt:
      "Front of tote bag with washed black canvas body, black straps, and tan leather handles and accents.",
  },
  {
    id: 3,
    name: "Medium Stuff Satchel",
    href: "#",
    price: "$220",
    availability: "Blue",
    imageSrc:
      "https://tailwindui.com/img/ecommerce-images/category-page-07-product-03.jpg",
    imageAlt:
      "Front of satchel with blue canvas body, black straps and handle, drawstring top, and front zipper pouch.",
  },
  // More products...
];

function ProductExamples() {
  return products.map((product) => (
    <a key={product.id} href={product.href} className="group text-sm">
      <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-100 group-hover:opacity-75">
        <img
          src={product.imageSrc}
          alt={product.imageAlt}
          className="h-full w-full object-cover object-center"
        />
      </div>
      <h3 className="mt-4 font-medium text-gray-900">{product.name}</h3>
      <p className="italic text-gray-500">{product.availability}</p>
      <p className="mt-2 font-medium text-gray-900">{product.price}</p>
    </a>
  ));
}

function InitCodeblock({ code }: { code: string }) {
  // Probably a more elegant solution, but this is what I've got
  let [npxMaybe, ...otherCode] = code.trim().split(" ");

  return (
    <div className="relative">
      <pre
        data-nonumber=""
        data-line-numbers="false"
        data-lang="shellscript"
        className="p-4 break-normal border rounded-lg border-gray-100 text-sm overflow-auto dark:border-gray-800"
      >
        <code>
          {npxMaybe === "npx" ? (
            <>
              <span className="text-blue-500 dark:text-blue-300">
                {npxMaybe}
              </span>{" "}
              <span className="text-green-500 dark:text-yellow-brand">
                {otherCode.join(" ")}
              </span>
            </>
          ) : (
            <span className="text-green-500">{code}</span>
          )}
        </code>
      </pre>
      <button
        type="button"
        data-code-block-copy=""
        className="h-6 w-6 absolute top-2 right-2 cursor-pointer text-gray-700 opacity-1 dark:text-gray-300"
        style={{
          backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23aaa' viewBox='0 0 36 36'%3E%3Cpath d='M22.6 4h-1.05a3.89 3.89 0 0 0-7.31 0h-.84A2.41 2.41 0 0 0 11 6.4V10h14V6.4A2.41 2.41 0 0 0 22.6 4Zm.4 4H13V6.25a.25.25 0 0 1 .25-.25h2.69l.12-1.11a1.24 1.24 0 0 1 .55-.89 2 2 0 0 1 3.15 1.18l.09.84h2.9a.25.25 0 0 1 .25.25ZM33.25 18.06H21.33l2.84-2.83a1 1 0 1 0-1.42-1.42l-5.25 5.25 5.25 5.25a1 1 0 0 0 .71.29 1 1 0 0 0 .71-1.7l-2.84-2.84h11.92a1 1 0 0 0 0-2Z'/%3E%3Cpath d='M29 16h2V6.68A1.66 1.66 0 0 0 29.35 5h-2.27v2H29ZM29 31H7V7h2V5H6.64A1.66 1.66 0 0 0 5 6.67v24.65A1.66 1.66 0 0 0 6.65 33h22.71A1.66 1.66 0 0 0 31 31.33v-9.27h-2Z'/%3E%3C/svg%3E")`,
        }}
      >
        <span className="sr-only">Copy code to clipboard</span>
      </button>
    </div>
  );
}
