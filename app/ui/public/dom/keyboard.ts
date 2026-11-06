export function isEditableKeyTarget(event: KeyboardEvent): boolean {
  let element = event.target;
  if (!(element instanceof HTMLElement)) return false;

  return (
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.isContentEditable
  );
}
