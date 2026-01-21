const REMIX_R_PATH =
  "M1736.59 960.945L1728.85 990H1803.07L1809.45 966.049C1810.14 963.474 1808.21 960.945 1805.56 960.945H1736.59ZM1757.03 884.15L1749.5 912.391H1889.37C1894.63 912.391 1898.27 914.755 1897.49 917.672H1897.49C1896.71 920.588 1891.81 922.953 1886.56 922.953H1746.69L1739.17 951.195H1819.02C1821.29 951.195 1823.51 951.847 1825.42 953.075L1881.65 990H1968.06L1908.97 951.196H1911.85C1939.98 951.196 1966.15 938.553 1970.3 922.956L1973.12 912.396C1977.27 896.799 1957.84 884.155 1929.71 884.155V884.153L1929.71 884.15H1757.03Z";

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
