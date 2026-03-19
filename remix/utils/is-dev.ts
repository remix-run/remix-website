export function isDevEnvironment(): boolean {
  return (
    typeof process !== "undefined" && process.env.NODE_ENV !== "production"
  );
}
