export function isEditableKeyTarget(event: KeyboardEvent): boolean {
  let element = event.target as HTMLElement | null;
  if (!element) return false;

  return (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.isContentEditable
  );
}
