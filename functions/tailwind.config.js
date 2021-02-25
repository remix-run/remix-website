const plugin = require("tailwindcss/plugin");

module.exports = {
  future: {
    purgeLayersByDefault: true,
  },
  experimental: {
    darkModeVariant: false,
  },
  purge: [
    "./app/**/*.tsx",
    "./app/**/*.ts",
    "./app/**/*.js",
    "./app/**/*.mdx",
    "./app/**/*.md",
    "./remix.config.js",
  ],
  plugins: [
    require("@tailwindcss/ui")({ layout: "sidebar" }),
    require("@tailwindcss/typography"),
    neonButton(),
  ],
  theme: {
    typography: (theme) => ({
      default: {
        css: {
          a: {
            color: theme("colors.aqua.600"),
            "&:hover": {
              color: theme("colors.aqua.500"),
            },
            "&:active": {
              color: theme("colors.aqua.400"),
            },
          },
        },
      },

      dark: {
        css: {
          color: theme("colors.gray.300"),
          h1: {
            color: theme("colors.gray.100"),
          },
          h2: {
            color: theme("colors.gray.100"),
          },
          h3: {
            color: theme("colors.gray.100"),
          },
          h4: {
            color: theme("colors.gray.100"),
          },
          h5: {
            color: theme("colors.gray.100"),
          },
          h6: {
            color: theme("colors.gray.100"),
          },

          strong: {
            color: theme("colors.gray.100"),
          },

          code: {
            color: theme("colors.gray.100"),
          },

          figcaption: {
            color: theme("colors.gray.500"),
          },
        },
      },
    }),
    extend: {
      fontSize: {
        xs: "0.85rem",
        sm: "0.95rem",
      },
      boxShadow: {
        yellow: "0 0 1px 3px rgb(255, 223, 9)",
      },
      colors: {
        aqua: {
          50: "#F3FDFD",
          100: "#E7FBFB",
          200: "#C4F6F4",
          300: "#A0F1EE",
          400: "#59E6E1",
          500: "#12DBD4",
          600: "#10C5BF",
          700: "#0B837F",
          800: "#08635F",
          900: "#054240",
          950: "#021c1c",
        },
        green: {
          50: "#F3FEF8",
          100: "#E6FCF1",
          200: "#C2F8DB",
          300: "#9DF3C5",
          400: "#53EA9A",
          500: "#09E16F",
          600: "#08CB64",
          700: "#058743",
          800: "#046532",
          900: "#034421",
          950: "#02361a",
        },
        pink: {
          50: "#FEF7FC",
          100: "#FDF0F9",
          200: "#F9D9F0",
          300: "#F5C1E7",
          400: "#EE93D5",
          500: "#E765C3",
          600: "#D05BB0",
          700: "#8B3D75",
          800: "#682D58",
          900: "#451E3B",
        },
        red: {
          50: "#FFF5F6",
          100: "#FFECED",
          200: "#FFCFD3",
          300: "#FFB1B8",
          400: "#FF7783",
          500: "#FF3D4E",
          600: "#E63746",
          700: "#99252F",
          800: "#731B23",
          900: "#4D1217",
        },
        yellow: {
          50: "#FFFDF8",
          100: "#FFFCF1",
          200: "#FFF7DC",
          300: "#FFF3C6",
          400: "#FFE99C",
          500: "#FFE071",
          600: "#E6CA66",
          700: "#998644",
          800: "#736533",
          900: "#4D4322",
        },
        blue: {
          50: "#F5F8FB",
          100: "#ECF1F8",
          200: "#CEDBED",
          300: "#B1C6E1",
          400: "#779BCB",
          500: "#3C70B5",
          600: "#3665A3",
          700: "#24436D",
          800: "#1B3251",
          900: "#122236",
        },
        gray: {
          50: "#fefefe",
          100: "#fcfcfc",
          200: "#eeeeee",
          300: "#e0e0e0",
          400: "#bdbdbd",
          500: "#9e9e9e",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
        },
      },
    },
  },
  variants: {
    typography: ["responsive"],
    backgroundColor: ["hover", "focus", "active", "disabled", "responsive"],
    textColor: ["hover", "focus", "active", "disabled", "responsive"],
    opacity: ["hover", "focus", "active", "disabled"],
    borderWidth: ["responsive", "last"],
  },
};

////////////////////////////////////////////////////////////////////////////////
function neonButton() {
  return plugin(({ addUtilities, addComponents }) => {
    addComponents({
      // learn how to do this and get the ability to use the normal theme
      // colors and stuff like neon-blue, neon-yellow, etc.
      ".neon-button": {
        transitionProperty: "transform, opacity, background",
        transitionDuration: "200ms",
        transitionTimingFunction: "ease-out",
        transform: "scale(1.00001)",
        textShadow: "0px 0px 5px hsla(0, 0%, 0%, 0.1)",
        background: "hsl(209, 63%, 76%)",
        boxShadow: `
            0 0 1em rgb(39, 113, 186),
            0 0 1.5em rgb(39, 113, 186) inset
          `,
        "&:disabled": {
          boxShadow: "0 0 1.5em rgb(39, 113, 186) inset",
        },
        "&:focus": {
          outline: "none",
          background: "hsl(209, 63%, 76%)",
          boxShadow: `
                0 0 1px 3px rgb(255, 223, 9),
                0 0 1.5em rgb(39, 113, 186) inset
              `,
        },
        "&:focus:not(:focus-visible)": {
          boxShadow: `
              0 0 1em rgb(39, 113, 186),
              0 0 1.5em rgb(39, 113, 186) inset
            `,
        },
        "&:active:not(:focus-visible)": {
          boxShadow: `
              0 0 1.5em rgb(39, 113, 186) inset
            `,
        },
        "&:active": {
          outline: "none",
          background: "hsl(209, 33%, 66%)",
          transform: "scale(0.98)",
          boxShadow: `
              0 0 1.5em rgb(39, 113, 186) inset
            `,
        },
      },
    });
  });
}
