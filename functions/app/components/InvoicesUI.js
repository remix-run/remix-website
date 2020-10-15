import * as React from "react";

// let dColors = {
//   aqua: "#D5F3F1",
//   green: "#BFF3C6",
//   pink: "#F9AAE0",
//   red: "#FF8287",
//   yellow: "#FFEAAA",
//   blue: "#92B6E0",
// };

let palette = {
  aqua: "#12DBD4",
  green: "#09E16F",
  pink: "#E765C3",
  red: "#FF3D4E",
  yellow: "#FFE071",
  blue: "#3C70B5",
};

let { green, pink, aqua, blue } = palette;
let steps = [
  [null, null, null, null],
  [aqua, null, null, null],
  [aqua, blue, null, null],
  [aqua, blue, green, null],
  [aqua, blue, green, pink],
];

export function AnimatedExampleApp() {
  let [step, setStep] = React.useState(0);
  React.useEffect(() => {
    let next = (step + 1) % steps.length;
    let id = setTimeout(
      () => {
        setStep(next);
      },
      next === 0 ? 2000 : 1000
    );
    return () => clearTimeout(id);
  }, [step]);
  return ExampleApp({ step });
}

export function ExampleApp({ step, hideInvoice = false }) {
  let colors = steps[step || 0];
  return (
    <svg viewBox="0 0 577.414 510.445" style={{ marginBottom: "1rem" }}>
      <path
        d="M10.032 86.086c122.76.491 246.707.328 556.287.345m-555.925.374c116.62-1.192 234.103-.574 556.262.152m-.067.679c-2.12 141.741-1.496 283.946-.684 413.767m.935-415.22c1.258 148.452 1.052 295.91-.094 414.366m-.494-.852c-174.446 1.174-348.742.866-556.357.074m556.21.554c-126.38-.996-253.544-1.169-555.717-.163m.219.394c-2.782-122.04-2.171-246.008.304-413.008M9.501 500.55c-.742-134.909-.448-270.165.974-413.709"
        stroke="hsl(214 50% 24% / 1)"
        fill="none"
      />
      <text
        y={18}
        fontFamily="Virgil, Segoe UI Emoji"
        fontSize={20}
        style={{
          whiteSpace: "pre",
        }}
        transform="translate(30.14 100.871)"
      >
        {"Invoices Projects Customers"}
      </text>
      <path
        d="M10.29 144.826c92.63.256 462.956.665 555.753.464m-554.14-1.285c92.575-.015 460.704-.457 553.194-.37M532.414 102.15c3.331.489 8.502 2.727 10.917 5.256 2.416 2.53 3.914 7.079 3.577 9.92-.337 2.841-3.093 5.148-5.598 7.127-2.505 1.98-6.047 4.42-9.432 4.748-3.385.327-7.85-1.25-10.88-2.784-3.03-1.533-6.137-3.863-7.304-6.417-1.167-2.553-.957-6.255.302-8.903 1.259-2.647 3.745-5.427 7.251-6.98 3.506-1.554 11.188-2.184 13.787-2.34 2.6-.157 1.723 1.174 1.807 1.401m-4.915-.148c3.441.03 6.168 1.453 8.794 3.428 2.626 1.976 6.25 5.641 6.962 8.426.712 2.784-.56 5.894-2.693 8.28-2.133 2.387-6.375 5.194-10.106 6.038-3.732.844-9.026.088-12.282-.976-3.256-1.063-5.694-2.716-7.254-5.405-1.56-2.689-2.955-7.763-2.106-10.728.849-2.965 4.523-5.333 7.2-7.06 2.675-1.73 7.261-2.97 8.857-3.31 1.596-.34.772 1.184.717 1.27"
        stroke="hsl(214 50% 24% / 1)"
        fill="none"
      />
      <path
        d="M520.752 125.176c1.373-1.375 7.1-5.276 7.954-8.089.853-2.813-4.292-7.417-2.833-8.79 1.458-1.374 9.506-1.056 11.585.547 2.08 1.603 1.476 7.517.89 9.07-.585 1.55-4.965-1.18-4.405.24.56 1.42 6.345 6.792 7.765 8.28m-21.799-1.81c1.222-.678 7.456-3.095 8.361-6.124.906-3.029-4.522-10.538-2.928-12.05 1.593-1.512 10.575 1.52 12.488 2.98 1.914 1.458-.581 3.97-1.01 5.771-.428 1.8-2.455 3.349-1.56 5.033.895 1.683 5.862 3.892 6.932 5.069M133.934 146.565c-.07 59.104-.145 293.82-.415 352.593m-.535-353.172c-.265 59.338.174 295.265-.122 354.288"
        stroke="hsl(214 50% 24% / 1)"
        fill="none"
      />
      <g fontFamily="Virgil, Segoe UI Emoji" fontSize={20}>
        <text
          y={18}
          style={{
            whiteSpace: "pre",
          }}
          transform="translate(25.996 171.953)"
        >
          {"#10123"}
        </text>
        <text
          y={68}
          style={{
            whiteSpace: "pre",
          }}
          transform="translate(25.996 171.953)"
        >
          {"#10122"}
        </text>
        <text
          y={118}
          style={{
            whiteSpace: "pre",
          }}
          transform="translate(25.996 171.953)"
        >
          {"#10121"}
        </text>
        <text
          y={168}
          style={{
            whiteSpace: "pre",
          }}
          transform="translate(25.996 171.953)"
        >
          {"#10119"}
        </text>
        <text
          y={218}
          style={{
            whiteSpace: "pre",
          }}
          transform="translate(25.996 171.953)"
        >
          {"#10118"}
        </text>
        <text
          y={268}
          style={{
            whiteSpace: "pre",
          }}
          transform="translate(25.996 171.953)"
        >
          {"#10117"}
        </text>
        <text
          y={318}
          style={{
            whiteSpace: "pre",
          }}
          transform="translate(25.996 171.953)"
        >
          {"#10116"}
        </text>
      </g>
      <path
        d="M129.738 148.681c.331 17.871.312 89.11-.003 107.061m-.98-104.915c.354 17.576.3 85.626.551 102.904"
        stroke="hsl(214 50% 24% / 1)"
        fill="none"
      />
      {hideInvoice !== true && (
        <>
          <text
            y={18}
            fontFamily="Virgil, Segoe UI Emoji"
            fontSize={20}
            style={{
              whiteSpace: "pre",
            }}
            transform="translate(151.105 156.54)"
          >
            {"Invoice #10121"}
          </text>
          <text
            y={18}
            fontFamily="Virgil, Segoe UI Emoji"
            fontSize={20}
            style={{
              whiteSpace: "pre",
            }}
            transform="translate(367.45 155.871)"
          >
            {"Details"}
          </text>
          <path
            d="M564.013 195.63c-71.101-.233-354.578.334-425.712.053M566 197.8c-71.306-.594-357.588-3.175-428.67-3.652"
            stroke="hsl(214 50% 24% / 1)"
            fill="none"
          />
          <g fontFamily="Virgil, Segoe UI Emoji" fontSize={20}>
            <text
              y={18}
              style={{
                whiteSpace: "pre",
              }}
              transform="translate(249.95 240.2)"
            >
              {"Viewed 10/10"}
            </text>
            <text
              y={68}
              style={{
                whiteSpace: "pre",
              }}
              transform="translate(249.95 240.2)"
            >
              {"Sent 10/09"}
            </text>
            <text
              y={118}
              style={{
                whiteSpace: "pre",
              }}
              transform="translate(249.95 240.2)"
            >
              {"Created 09/28"}
            </text>
          </g>
          <text
            y={18}
            fontFamily="Virgil, Segoe UI Emoji"
            fontSize={20}
            style={{
              whiteSpace: "pre",
            }}
            transform="translate(476.3 155.957)"
          >
            {"Activity"}
          </text>
          <path
            d="M478.787 183.309c10.132.035 50.583-.48 60.652-.475m-58.668-.624c9.976.23 47.288 1.32 57.442 1.694M33.048 128.451c12.54.446 62.305 1.208 74.504 1.332m-75.604-2.249c12.469.186 62.919-.072 75.138.423M29.129 299.019c9.566-.204 47.865-.656 57.361-.536m-55.478-.605c9.511-.136 45.748 1.039 54.816 1.587"
            stroke={"hsl(214 50% 24% / 1)"}
            strokeWidth={4}
            fill="none"
          />
        </>
      )}
      <text
        y={18}
        fontFamily="Virgil, Segoe UI Emoji"
        fontSize={20}
        fill={colors[0]}
        style={{
          opacity: colors[0] ? 1 : 0,
          whiteSpace: "pre",
        }}
        transform="translate(15.068 10)"
      >
        {"App.js"}
      </text>
      <text
        y={18}
        fontFamily="Virgil, Segoe UI Emoji"
        fontSize={20}
        fill={colors[1] || "transparent"}
        style={{
          opacity: colors[1] ? 1 : 0,
          whiteSpace: "pre",
        }}
        transform="translate(79.865 12.914)"
      >
        {"> routes/invoices.js"}
      </text>
      <text
        y={18}
        fontFamily="Virgil, Segoe UI Emoji"
        fontSize={20}
        fill={colors[2]}
        style={{
          opacity: colors[2] ? 1 : 0,
          whiteSpace: "pre",
        }}
        transform="translate(276.475 13.348)"
      >
        {"> $id.js"}
      </text>
      <text
        y={18}
        fontFamily="Virgil, Segoe UI Emoji"
        fontSize={20}
        fill={colors[3]}
        style={{
          opacity: colors[3] ? 1 : 0,
          whiteSpace: "pre",
        }}
        transform="translate(356.486 13.922)"
      >
        {"> activity.js"}
      </text>
      <text
        y={18}
        fontFamily="Virgil, Segoe UI Emoji"
        fontSize={20}
        fill={colors[0]}
        style={{
          opacity: colors[0] ? 1 : 0,
          whiteSpace: "pre",
        }}
        transform="translate(14.197 45.613)"
      >
        {"http://example.com"}
      </text>
      <text
        y={18}
        fontFamily="Virgil, Segoe UI Emoji"
        fontSize={20}
        fill={colors[1]}
        style={{
          opacity: colors[1] ? 1 : 0,
          whiteSpace: "pre",
        }}
        transform="translate(197.87 48.566)"
      >
        {"/invoices"}
      </text>
      <text
        y={18}
        fontFamily="Virgil, Segoe UI Emoji"
        fontSize={20}
        fill={colors[2]}
        style={{
          opacity: colors[2] ? 1 : 0,
          whiteSpace: "pre",
        }}
        transform="translate(282.88 50.418)"
      >
        {"/10121"}
      </text>
      <text
        y={18}
        fontFamily="Virgil, Segoe UI Emoji"
        fontSize={20}
        fill={colors[3]}
        style={{
          opacity: colors[3] ? 1 : 0,
          whiteSpace: "pre",
        }}
        transform="translate(340.38 50.79)"
      >
        {"/activity"}
      </text>
      <path
        d="M12.326 87.066c200.536.642 401.15.69 555.283-.64m-554.657-.12c156.078 2.098 311.794 1.703 554.579.658m.49-.99c-2.04 126.068-3.17 251.303-1.075 414.03m.309-413.148c-1.579 147.155-2.272 294.562.616 413.828m-.099.243c-141.937 1.984-283.764 2.342-555.367-1.177m555.074.407c-179.152-1.195-358.333-.91-554.86.182m1.144.938c-1.652-111.485-2.083-222.101-1.196-413.67m.286 413.095c2.182-153.066 1.962-307.17-.052-413.683"
        stroke={colors[0]}
        strokeWidth={4}
        fill="none"
        style={{ opacity: colors[0] ? 1 : 0 }}
      />
      <path
        d="M20.876 145.892c125.095-1.564 250.77-1.991 537.862-.34m-537.76.299c125.497.606 250.436 1.264 537.703.112m.514-.38c1.92 138.055 1.397 276.09-.252 349.551m.037-349.897c1.835 99.694 1.67 198.393-.339 350.484m.122-.253c-202.318.48-404.63 1.003-537.466-.515m537.147.634c-143.63.397-287.653.564-536.923-.596m-1.393.134c.357-106.265-.722-212.651.248-348.784m.781 349.207c.66-114.367.184-227.567.167-349.681"
        stroke={colors[1]}
        strokeWidth={4}
        fill="none"
        style={{ opacity: colors[1] ? 1 : 0 }}
      />
      <path
        d="M137.64 151.603c92.824-.927 185.82-1.732 416.135.37m-414.596-.255c149.983-2.447 301.176-1.997 415.143.097m-.936-.897c-.643 106.05.019 208.045 1.917 339.51m-.11-338.932c-.46 83.077-.906 164.966-.995 339.786m-.238.03c-88.752 1.045-176.43 2.063-414.491-1.008m415.11 1.11c-96.447-1.531-193.692-1.164-416.008-.039m-.341.589c.152-100.805-.154-200.306-.372-339.166m1.377 339.116c-.132-69.322.367-137.883-1.05-340.297"
        stroke={colors[2]}
        strokeWidth={4}
        fill="none"
        style={{ opacity: colors[2] ? 1 : 0 }}
      />
      <path
        d="M143.781 198.883c141.033 1.81 282.305.803 405.243-.407m-404.194.467c100.584.493 200.244.551 403.923 0m1.178-1.59c-.93 87.911-.975 175.32-2.607 289.267m2.194-288.236c-1.462 99.246-1.423 196.838-.334 288.37m-.054.284c-148.892-3.105-297.716-1.956-403.895-.419m403.947-.587c-129.606-1.66-259.663-1.11-404.02.309m.28 1.15c-.05-77.12-2.364-151.185-.883-287.988m-.296 287.59c-2.227-109.648-1.24-218.025 1.161-288.295"
        stroke={colors[3]}
        strokeWidth={4}
        fill="none"
        style={{ opacity: colors[3] ? 1 : 0 }}
      />
    </svg>
  );
}
