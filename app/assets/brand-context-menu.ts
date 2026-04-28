import { navigate, on } from "remix/ui";

export function brandContextMenu(brandHref: string) {
  return on<HTMLElement>("contextmenu", (event) => {
    event.preventDefault();
    void navigate(brandHref);
  });
}
