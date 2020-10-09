const plugin = require("tailwindcss/plugin");

module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  theme: {
    extend: {
      boxShadow: {
        yellow: "0 0 1px 3px rgb(255, 223, 9)",
      },
      colors: {
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
    require("@tailwindcss/ui"),
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
