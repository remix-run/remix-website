const plugin = require("tailwindcss/plugin");

module.exports = {
  future: {
    purgeLayersByDefault: true,
  },
  purge: ["./app/**/*.js", "./app/**/*.mdx", "./app/**/*.md"],
  theme: {
    extend: {
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
    backgroundColor: ["hover", "focus", "active", "disabled"],
    textColor: ["hover", "focus", "active", "disabled"],
    opacity: ["hover", "focus", "active", "disabled"],
  },
  plugins: [
    require("@tailwindcss/ui")({
      layout: "sidebar",
    }),
    plugin(({ addUtilities, addComponents }) => {
      addUtilities({
        ".delay-100": {
          "transition-delay": "100ms",
        },
        ".delay-200": {
          "transition-delay": "200ms",
        },
        ".delay-300": {
          "transition-delay": "300ms",
        },
        ".delay-400": {
          "transition-delay": "400ms",
        },
        ".delay-500": {
          "transition-delay": "500ms",
        },
        ".delay-600": {
          "transition-delay": "600ms",
        },
        ".delay-700": {
          "transition-delay": "700ms",
        },
        ".delay-800": {
          "transition-delay": "800ms",
        },
        ".delay-900": {
          "transition-delay": "900ms",
        },
        ".delay-1000": {
          "transition-delay": "1000ms",
        },
        ".delay-1100": {
          "transition-delay": "1100ms",
        },
      });

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
    }),
  ],
};
