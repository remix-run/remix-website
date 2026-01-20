const REMIX_R_PATH =
  "M1757.07 884.025L1749.55 912.385H1889.4C1894.66 912.385 1898.3 914.76 1897.52 917.688H1897.52C1896.74 920.617 1891.84 922.991 1886.59 922.991H1746.73L1739.21 951.354H1819.06C1821.32 951.354 1823.54 952.008 1825.46 953.241L1881.68 990.322H1968.08L1909 951.354H1911.88C1940 951.354 1966.17 938.658 1970.33 922.995L1973.14 912.39C1977.3 896.727 1957.86 884.03 1929.73 884.03V884.027L1929.74 884.025H1757.07ZM1736.61 961.143L1728.88 990.318H1803.09L1809.47 966.268C1810.16 963.682 1808.23 961.143 1805.58 961.143H1736.61Z";

export function IntroMaskReveal() {
  return (
    <div aria-hidden="true" className="rmx-intro-mask-overlay">
      <svg
        className="rmx-intro-mask-svg"
        viewBox="0 0 3600 1921"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Mask: white = visible, black = transparent */}
          <mask id="r-cutout-mask">
            <rect x="0" y="0" width="3600" height="1921" fill="white" />
            <path d={REMIX_R_PATH} fill="black" />
          </mask>
          <clipPath id="color-stripes">
            <rect
              width="374"
              height="134"
              fill="white"
              transform="translate(1613 856)"
            />
          </clipPath>
        </defs>

        {/* Solid R fill that fades out so users can see the shape first */}
        <path
          className="rmx-intro-r-fill"
          d={REMIX_R_PATH}
          fill="var(--rmx-neutral-200)"
        />

        {/* Black overlay with R cutout */}
        <rect
          x="0"
          y="0.5"
          width="3600"
          height="1920"
          fill="black"
          mask="url(#r-cutout-mask)"
        />

        <g clipPath="url(#color-stripes)">
          <path
            d="M1690.45 960.945H1667.23L1659.48 990H1682.69L1690.45 960.945Z"
            fill="#FECC1B"
          />
          <path
            d="M1677.37 922.953L1669.83 951.196H1693.06L1700.6 922.953H1677.37Z"
            fill="#FECC1B"
          />
          <path
            d="M1703.42 912.39L1710.96 884.15H1687.73L1680.19 912.39H1703.42Z"
            fill="#FECC1B"
          />
          <path
            d="M1667.22 960.945H1644L1636.25 990H1659.46L1667.22 960.945Z"
            fill="#6BD968"
          />
          <path
            d="M1680.19 912.39L1687.73 884.15H1664.49L1656.96 912.39H1680.19Z"
            fill="#6BD968"
          />
          <path
            d="M1654.14 922.953L1646.6 951.196H1669.82L1677.37 922.953H1654.14Z"
            fill="#6BD968"
          />
          <path
            d="M1643.97 960.945H1620.75L1613 990H1636.21L1643.97 960.945Z"
            fill="#3992FF"
          />
          <path
            d="M1630.89 922.953L1623.35 951.196H1646.57L1654.12 922.953H1630.89Z"
            fill="#3992FF"
          />
          <path
            d="M1656.94 912.39L1664.48 884.15H1641.24L1633.71 912.39H1656.94Z"
            fill="#3992FF"
          />
          <path
            d="M1713.4 960.945H1690.18L1682.43 990H1705.64L1713.4 960.945Z"
            fill="#D83BD2"
          />
          <path
            d="M1700.32 922.953L1692.78 951.196H1716L1723.55 922.953H1700.32Z"
            fill="#D83BD2"
          />
          <path
            d="M1726.37 912.39L1733.91 884.15H1710.67L1703.13 912.39H1726.37Z"
            fill="#D83BD2"
          />
          <path
            d="M1736.63 960.945H1713.41L1705.66 990H1728.87L1736.63 960.945Z"
            fill="#F44250"
          />
          <path
            d="M1723.55 922.953L1716.01 951.196H1739.23L1746.78 922.953H1723.55Z"
            fill="#F44250"
          />
          <path
            d="M1749.6 912.39L1757.14 884.15H1733.9L1726.37 912.39H1749.6Z"
            fill="#F44250"
          />
        </g>
      </svg>
    </div>
  );
}
