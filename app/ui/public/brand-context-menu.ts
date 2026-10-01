import { navigate, on } from "remix/component";

export function brandContextMenu(brandHref: string) {
  return on<HTMLElement>("contextmenu", (event) => {
    event.preventDefault();
    void navigate(brandHref);
  });
}
