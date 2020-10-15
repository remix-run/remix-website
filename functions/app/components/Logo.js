import React, { useState, useRef } from "react";
import { useThrottle } from "use-throttle";
import { detect } from "detect-browser";

let colorMap = {
  aqua: "#D5F3F1",
  green: "#BFF3C6",
  pink: "#F9AAE0",
  red: "#FF8287",
  yellow: "#FFEAAA",
  blue: "#92B6E0",
};

let defaultColors = ["aqua", "green", "pink", "red", "yellow"];

export function useLogoAnimation() {
  let [colors, setColors] = useState(defaultColors);
  let throttled = useThrottle(colors, 250);

  let changeColors = () => {
    setColors(colors.slice(0).sort((a, b) => Math.random() - 0.5));
  };

  return [throttled, changeColors];
}

export default function Logo({ colors = defaultColors, ...props }) {
  let [r, e, m, i, x] = colors;

  // Safari doesn't update the inner shadows on the logo, so we force a full
  // rerender with a key
  let sniffRef = useRef(null);
  if (sniffRef.current === null) {
    sniffRef.current = typeof window === "undefined" ? "server" : detect().name;
  }
  let logoKey = ["safari", "ios"].includes(sniffRef.current)
    ? colors.join()
    : undefined;

  return (
    <svg
      key={logoKey}
      {...props}
      style={{ overflow: "visible" }}
      viewBox="0 0 643 239"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
    >
      <defs>
        <polygon
          id="path-1"
          points="575.126626 111.189005 588.516179 82 642.161787 82 606.76991 133.930656 643 186 588.516179 186 574.487146 155.128421 560.855162 186 507 186 543.232368 133.100833 507.838213 82 562.112481 82"
        ></polygon>
        <filter
          x="-16.5%"
          y="-21.6%"
          width="200%"
          height="200%"
          filterUnits="objectBoundingBox"
          id="yellow-outer"
        >
          <feOffset
            dx="0"
            dy="0"
            in="SourceAlpha"
            result="shadowOffsetOuter1"
          ></feOffset>
          <feGaussianBlur
            stdDeviation="5"
            in="shadowOffsetOuter1"
            result="shadowBlurOuter1"
          ></feGaussianBlur>
          <feColorMatrix
            values="0 0 0 0 1   0 0 0 0 0.878431373   0 0 0 0 0.443137255  0 0 0 1 0"
            type="matrix"
            in="shadowBlurOuter1"
          ></feColorMatrix>
        </filter>
        <filter
          x="-16.5%"
          y="-21.6%"
          width="133.1%"
          height="143.3%"
          filterUnits="objectBoundingBox"
          id="yellow-inner"
        >
          <feGaussianBlur
            stdDeviation="7.5"
            in="SourceAlpha"
            result="shadowBlurInner1"
          ></feGaussianBlur>
          <feOffset
            dx="0"
            dy="0"
            in="shadowBlurInner1"
            result="shadowOffsetInner1"
          ></feOffset>
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            operator="arithmetic"
            k2="-1"
            k3="1"
            result="shadowInnerInner1"
          ></feComposite>
          <feColorMatrix
            values="0 0 0 0 1   0 0 0 0 0.878431373   0 0 0 0 0.443137255  0 0 0 1 0"
            type="matrix"
            in="shadowInnerInner1"
          ></feColorMatrix>
        </filter>
        <polygon
          id="path-4"
          points="575.126626 111.189005 588.516179 82 642.161787 82 606.76991 133.930656 643 186 588.516179 186 574.487146 155.128421 560.855162 186 507 186 543.232368 133.100833 507.838213 82 562.112481 82"
        ></polygon>
        <filter
          x="-16.5%"
          y="-21.6%"
          width="200%"
          height="200%"
          filterUnits="objectBoundingBox"
          id="blue-outer"
        >
          <feOffset
            dx="0"
            dy="0"
            in="SourceAlpha"
            result="shadowOffsetOuter1"
          ></feOffset>
          <feGaussianBlur
            stdDeviation="5"
            in="shadowOffsetOuter1"
            result="shadowBlurOuter1"
          ></feGaussianBlur>
          <feColorMatrix
            values="0 0 0 0 0.235294118   0 0 0 0 0.439215686   0 0 0 0 0.709803922  0 0 0 1 0"
            type="matrix"
            in="shadowBlurOuter1"
          ></feColorMatrix>
        </filter>
        <filter
          x="-16.5%"
          y="-21.6%"
          width="133.1%"
          height="143.3%"
          filterUnits="objectBoundingBox"
          id="blue-inner"
        >
          <feGaussianBlur
            stdDeviation="7.5"
            in="SourceAlpha"
            result="shadowBlurInner1"
          ></feGaussianBlur>
          <feOffset
            dx="0"
            dy="0"
            in="shadowBlurInner1"
            result="shadowOffsetInner1"
          ></feOffset>
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            operator="arithmetic"
            k2="-1"
            k3="1"
            result="shadowInnerInner1"
          ></feComposite>
          <feColorMatrix
            values="0 0 0 0 0.235294118   0 0 0 0 0.439215686   0 0 0 0 0.709803922  0 0 0 1 0"
            type="matrix"
            in="shadowInnerInner1"
          ></feColorMatrix>
        </filter>
        <path
          d="M447,58.5925852 L447,46.0086742 C447,40.4810361 451.450568,36 456.940621,36 L491.059379,36 C496.549432,36 501,40.4810361 501,46.0086742 L501,58.5925852 C501,64.1202234 496.549432,68.6012594 491.059379,68.6012594 L456.940621,68.6012594 C451.450568,68.6012594 447,64.1202234 447,58.5925852 Z M497.581032,81.9834715 L497.581032,186 L449.807612,186 L449.807612,81.9834715 L497.581032,81.9834715 Z"
          id="path-7"
        ></path>
        <filter
          x="-41.7%"
          y="-15.0%"
          width="200%"
          height="200%"
          filterUnits="objectBoundingBox"
          id="red-outer"
        >
          <feOffset
            dx="0"
            dy="0"
            in="SourceAlpha"
            result="shadowOffsetOuter1"
          ></feOffset>
          <feGaussianBlur
            stdDeviation="5"
            in="shadowOffsetOuter1"
            result="shadowBlurOuter1"
          ></feGaussianBlur>
          <feColorMatrix
            values="0 0 0 0 1   0 0 0 0 0.239215686   0 0 0 0 0.305882353  0 0 0 1 0"
            type="matrix"
            in="shadowBlurOuter1"
          ></feColorMatrix>
        </filter>
        <filter
          x="-41.7%"
          y="-15.0%"
          width="183.3%"
          height="130.0%"
          filterUnits="objectBoundingBox"
          id="red-inner"
        >
          <feGaussianBlur
            stdDeviation="7.5"
            in="SourceAlpha"
            result="shadowBlurInner1"
          ></feGaussianBlur>
          <feOffset
            dx="0"
            dy="0"
            in="shadowBlurInner1"
            result="shadowOffsetInner1"
          ></feOffset>
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            operator="arithmetic"
            k2="-1"
            k3="1"
            result="shadowInnerInner1"
          ></feComposite>
          <feColorMatrix
            values="0 0 0 0 1   0 0 0 0 0.239215686   0 0 0 0 0.305882353  0 0 0 1 0"
            type="matrix"
            in="shadowInnerInner1"
          ></feColorMatrix>
        </filter>
        <path
          d="M259,186 L259,82.0784314 L302.286215,82.0784314 L303.331776,104.733333 C306.398769,96.8352546 310.999191,90.7385836 317.133178,86.4431373 C323.267165,82.1476909 330.795127,80 339.71729,80 C347.663591,80 354.250558,81.8012892 359.478388,85.4039216 C364.706218,89.006554 368.435347,94.1333001 370.665888,100.784314 C372.896429,96.3503046 375.649711,92.5745254 378.925818,89.4568627 C382.201924,86.3392001 386.035609,83.9836681 390.426986,82.3901961 C394.818363,80.7967241 399.732449,80 405.169393,80 C412.139832,80 418.064617,81.3509669 422.943925,84.0529412 C427.823233,86.7549155 431.552362,90.7038956 434.131425,95.9 C436.710488,101.096104 438,107.435257 438,114.917647 L438,186 L389.904206,186 L389.904206,127.388235 C389.904206,122.677101 389.311727,119.490204 388.126752,117.827451 C386.941778,116.164698 385.094639,115.333333 382.58528,115.333333 C380.35474,115.333333 378.472749,115.887576 376.939252,116.996078 C375.405756,118.104581 374.290502,119.87123 373.593458,122.296078 C372.896414,124.720927 372.547897,127.803903 372.547897,131.545098 L372.547897,186 L324.452103,186 L324.452103,127.388235 C324.452103,122.677101 323.859624,119.490204 322.67465,117.827451 C321.489675,116.164698 319.642536,115.333333 317.133178,115.333333 C314.902637,115.333333 313.020646,115.887576 311.48715,116.996078 C309.953653,118.104581 308.838399,119.87123 308.141355,122.296078 C307.444311,124.720927 307.095794,127.803903 307.095794,131.545098 L307.095794,186 L259,186 Z"
          id="path-10"
        ></path>
        <filter
          x="-12.6%"
          y="-21.2%"
          width="200%"
          height="200%"
          filterUnits="objectBoundingBox"
          id="pink-outer"
        >
          <feOffset
            dx="0"
            dy="0"
            in="SourceAlpha"
            result="shadowOffsetOuter1"
          ></feOffset>
          <feGaussianBlur
            stdDeviation="5"
            in="shadowOffsetOuter1"
            result="shadowBlurOuter1"
          ></feGaussianBlur>
          <feColorMatrix
            values="0 0 0 0 0.905882353   0 0 0 0 0.396078431   0 0 0 0 0.764705882  0 0 0 1 0"
            type="matrix"
            in="shadowBlurOuter1"
          ></feColorMatrix>
        </filter>
        <filter
          x="-12.6%"
          y="-21.2%"
          width="125.1%"
          height="142.5%"
          filterUnits="objectBoundingBox"
          id="pink-inner"
        >
          <feGaussianBlur
            stdDeviation="7.5"
            in="SourceAlpha"
            result="shadowBlurInner1"
          ></feGaussianBlur>
          <feOffset
            dx="0"
            dy="0"
            in="shadowBlurInner1"
            result="shadowOffsetInner1"
          ></feOffset>
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            operator="arithmetic"
            k2="-1"
            k3="1"
            result="shadowInnerInner1"
          ></feComposite>
          <feColorMatrix
            values="0 0 0 0 0.905882353   0 0 0 0 0.396078431   0 0 0 0 0.764705882  0 0 0 1 0"
            type="matrix"
            in="shadowInnerInner1"
          ></feColorMatrix>
        </filter>
        <path
          d="M178.839046,143.138462 C179.115324,145.213654 179.512744,146.979034 180.031308,148.434615 C181.141196,151.550016 182.771321,153.626918 184.921731,154.665385 C187.072141,155.703851 189.812138,156.223077 193.141805,156.223077 C196.748944,156.223077 199.558308,155.426931 201.569982,153.834615 C203.581655,152.2423 204.934312,150.061552 205.627993,147.292308 L244.127072,157.676923 C242.600975,164.461572 239.201991,170.103824 233.930018,174.603846 C228.658046,179.103869 222.380331,182.461527 215.096685,184.676923 C207.813039,186.892319 200.286718,188 192.517495,188 C180.031245,188 169.348725,185.888483 160.469613,181.665385 C151.590502,177.442287 144.792534,171.315425 140.075506,163.284615 C135.358479,155.253806 133,145.492365 133,134 C133,122.507635 135.393162,112.746194 140.179558,104.715385 C144.965954,96.6845752 151.694555,90.5577134 160.365562,86.3346154 C169.036569,82.1115173 179.12947,80 190.644567,80 C202.437137,80 212.460671,82.1115173 220.71547,86.3346154 C228.970268,90.5577134 235.247983,96.476885 239.548803,104.092308 C243.849622,111.70773 246,120.56918 246,130.676923 C246,132.892319 245.895949,135.176911 245.687845,137.530769 C245.479741,139.884627 245.236957,141.753839 244.959484,143.138462 L178.839046,143.138462 Z M178.817394,125.484615 L201.072601,125.484615 C200.746942,122.232259 200.21906,119.532269 199.48895,117.384615 C198.170957,113.507673 195.292226,111.569231 190.85267,111.569231 C187.939212,111.569231 185.54605,112.261532 183.673112,113.646154 C181.800175,115.030776 180.447518,117.419214 179.615101,120.811538 C179.282918,122.165277 179.017015,123.722967 178.817394,125.484615 Z"
          id="path-13"
        ></path>
        <filter
          x="-19.9%"
          y="-20.8%"
          width="200%"
          height="200%"
          filterUnits="objectBoundingBox"
          id="green-outer"
        >
          <feOffset
            dx="0"
            dy="0"
            in="SourceAlpha"
            result="shadowOffsetOuter1"
          ></feOffset>
          <feGaussianBlur
            stdDeviation="5"
            in="shadowOffsetOuter1"
            result="shadowBlurOuter1"
          ></feGaussianBlur>
          <feColorMatrix
            values="0 0 0 0 0.0352941176   0 0 0 0 0.882352941   0 0 0 0 0.435294118  0 0 0 1 0"
            type="matrix"
            in="shadowBlurOuter1"
          ></feColorMatrix>
        </filter>
        <filter
          x="-19.9%"
          y="-20.8%"
          width="139.8%"
          height="141.7%"
          filterUnits="objectBoundingBox"
          id="green-inner"
        >
          <feGaussianBlur
            stdDeviation="7.5"
            in="SourceAlpha"
            result="shadowBlurInner1"
          ></feGaussianBlur>
          <feOffset
            dx="0"
            dy="0"
            in="shadowBlurInner1"
            result="shadowOffsetInner1"
          ></feOffset>
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            operator="arithmetic"
            k2="-1"
            k3="1"
            result="shadowInnerInner1"
          ></feComposite>
          <feColorMatrix
            values="0 0 0 0 0.0352941176   0 0 0 0 0.882352941   0 0 0 0 0.435294118  0 0 0 1 0"
            type="matrix"
            in="shadowInnerInner1"
          ></feColorMatrix>
        </filter>
        <path
          d="M9.99854549,112.188571 L62.7426698,112.188571 C67.708821,112.188571 71.4333786,111.295009 73.9164542,109.507857 C76.3995298,107.720705 77.641049,104.576689 77.641049,100.075714 C77.641049,95.707121 76.3995298,92.5961997 73.9164542,90.7428571 C71.4333786,88.8895145 67.708821,87.9628571 62.7426698,87.9628571 L9.99854549,87.9628571 C4.47650129,87.9628571 2.45235384e-15,83.4948417 1.77609847e-15,77.9832653 L1.77609847e-15,64.9795918 C1.09984309e-15,59.4680155 4.47650129,55 9.99854549,55 L70.7958478,55 C88.1102669,55 101.397878,58.8059143 110.659078,66.4178571 C119.920279,74.0298 124.55081,84.1237466 124.55081,96.7 C124.55081,111.129596 120.020943,121.984726 110.961073,129.265714 C107.674377,131.907076 103.844533,134.069321 99.4715239,135.752453 L132,186.057143 L81.0636496,186.057143 L57.568712,142.57 L9.99854549,142.57 C4.47650129,142.57 2.45235384e-15,138.101985 1.77609847e-15,132.590408 L0,122.168163 C-6.76255375e-16,116.656587 4.47650129,112.188571 9.99854549,112.188571 Z M45.0805912,187 L9.99854549,187 C4.47650129,187 6.76255375e-16,182.531985 0,177.020408 L0,163.979592 C-6.76255375e-16,158.468015 4.47650129,154 9.99854549,154 L45.0805912,154 C50.6026354,154 55.0791367,158.468015 55.0791367,163.979592 L55.0791367,177.020408 C55.0791367,182.531985 50.6026354,187 45.0805912,187 Z"
          id="path-16"
        ></path>
        <filter
          x="-17.0%"
          y="-17.0%"
          width="200%"
          height="200%"
          filterUnits="objectBoundingBox"
          id="aqua-outer"
        >
          <feOffset
            dx="0"
            dy="0"
            in="SourceAlpha"
            result="shadowOffsetOuter1"
          ></feOffset>
          <feGaussianBlur
            stdDeviation="5"
            in="shadowOffsetOuter1"
            result="shadowBlurOuter1"
          ></feGaussianBlur>
          <feColorMatrix
            values="0 0 0 0 0.0705882353   0 0 0 0 0.858823529   0 0 0 0 0.831372549  0 0 0 1 0"
            type="matrix"
            in="shadowBlurOuter1"
          ></feColorMatrix>
        </filter>
        <filter
          x="-17.0%"
          y="-17.0%"
          width="134.1%"
          height="134.1%"
          filterUnits="objectBoundingBox"
          id="aqua-inner"
        >
          <feGaussianBlur
            stdDeviation="7.5"
            in="SourceAlpha"
            result="shadowBlurInner1"
          ></feGaussianBlur>
          <feOffset
            dx="0"
            dy="0"
            in="shadowBlurInner1"
            result="shadowOffsetInner1"
          ></feOffset>
          <feComposite
            in="shadowOffsetInner1"
            in2="SourceAlpha"
            operator="arithmetic"
            k2="-1"
            k3="1"
            result="shadowInnerInner1"
          ></feComposite>
          <feColorMatrix
            values="0 0 0 0 0.0705882353   0 0 0 0 0.858823529   0 0 0 0 0.831372549  0 0 0 1 0"
            type="matrix"
            in="shadowInnerInner1"
          ></feColorMatrix>
        </filter>
      </defs>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g>
          <use
            fill="black"
            fillOpacity="1"
            filter={`url(#${r}-outer)`}
            xlinkHref="#path-16"
          ></use>
          <use fill={colorMap[r]} fillRule="evenodd" xlinkHref="#path-16"></use>
          <use
            fill="black"
            fillOpacity="1"
            filter={`url(#${r}-inner)`}
            xlinkHref="#path-16"
          ></use>
        </g>
        <g>
          <use
            fill="black"
            fillOpacity="1"
            filter={`url(#${e}-outer)`}
            xlinkHref="#path-13"
          ></use>
          <use fill={colorMap[e]} fillRule="evenodd" xlinkHref="#path-13"></use>
          <use
            fill="black"
            fillOpacity="1"
            filter={`url(#${e}-inner)`}
            xlinkHref="#path-13"
          ></use>
        </g>
        <g>
          <use
            fill="black"
            fillOpacity="1"
            filter={`url(#${m}-outer)`}
            xlinkHref="#path-10"
          ></use>
          <use fill={colorMap[m]} fillRule="evenodd" xlinkHref="#path-10"></use>
          <use
            fill="black"
            fillOpacity="1"
            filter={`url(#${m}-inner)`}
            xlinkHref="#path-10"
          ></use>
        </g>
        <g>
          <use
            fill="black"
            fillOpacity="1"
            filter={`url(#${i}-outer)`}
            xlinkHref="#path-7"
          ></use>
          <use fill={colorMap[i]} fillRule="evenodd" xlinkHref="#path-7"></use>
          <use
            fill="black"
            fillOpacity="1"
            filter={`url(#${i}-inner)`}
            xlinkHref="#path-7"
          ></use>
        </g>
        <g>
          <use
            fill="black"
            fillOpacity="1"
            filter={`url(#${x}-outer)`}
            xlinkHref="#path-4"
          ></use>
          <use fill={colorMap[x]} fillRule="evenodd" xlinkHref="#path-4"></use>
          <use
            fill="black"
            fillOpacity="1"
            filter={`url(#${x}-inner)`}
            xlinkHref="#path-4"
          ></use>
        </g>
      </g>
    </svg>
  );
}
