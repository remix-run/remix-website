/** Jam 2025 is dark-only: white ink on a black page with a blue link accent. */
export let jamColors = {
  white: "#ffffff",
  black: "#000000",
  /** Hover surface for rows and cards on the black page. */
  surfaceHover: "#121212",
  /** De-emphasized text such as inactive navigation links. */
  textMuted: "#a4a4a4",
  link: "#59b0ff",
};

/** Translucent white for borders, washes, and secondary text. */
export function whiteAlpha(opacity: number) {
  return `rgb(255 255 255 / ${opacity})`;
}

/** Translucent black for scrims and shadows. */
export function blackAlpha(opacity: number) {
  return `rgb(0 0 0 / ${opacity})`;
}
