import { spring } from "@remix-run/ui/animation";

import { photoViewer } from "./photo-viewer-controller.ts";

/**
 * The viewer window's moves between its place and a gallery card. Each viewer
 * owns one, so a close that interrupts the open can take over from wherever
 * the window got to.
 */
export class WindowTransitions {
  // The move still playing, if any.
  #moves: Animation[] | undefined;

  /**
   * Grows the viewer out of the gallery card that opened it. Without that
   * card on screen (opened another way), the window rolls down instead, like
   * the tickets modal.
   */
  playEntrance(section: HTMLElement, slug: string) {
    let card = photoViewer.getCard(slug)?.parentElement;
    let box = card?.getBoundingClientRect();
    let onScreen = box && box.bottom > 0 && box.top < window.innerHeight;
    if (card && onScreen && this.animateToCard(section, card, "open")) return;

    section.animate(
      [
        { clipPath: "inset(0 0 100% 0 round 8px)" },
        { clipPath: "inset(0 0 0 0 round 8px)" },
      ],
      { ...spring("snappy", { duration: 220 }) },
    );
  }

  /**
   * Animates the viewer's window between its place and a gallery card's size
   * and spot: out of the card when opening, back into it when closing.
   * The card and the viewer's photo share an aspect ratio, so a single scale
   * maps one photo onto the other. Only the photo should look like it travels:
   * scaled along with it, the window's frame and title bar would end up far
   * smaller than the card's, so they cross-fade with the card's own instead.
   * The card's photo stays hidden meanwhile, so the photo looks lifted out of
   * the grid rather than copied.
   */
  animateToCard(
    section: HTMLElement,
    card: HTMLElement,
    direction: "open" | "close",
  ) {
    let titlebar = section.firstElementChild;
    let cardImage = card.lastElementChild;
    let body = section.lastElementChild;
    if (
      !(titlebar instanceof HTMLElement) ||
      !(cardImage instanceof HTMLElement) ||
      !(body instanceof HTMLElement)
    ) {
      return null;
    }

    // Interrupting a move: start from wherever it got to, then cancel it so the
    // window measures at its real place.
    let { backgroundColor, boxShadow, transform } = getComputedStyle(section);
    let titlebarOpacity = getComputedStyle(titlebar).opacity;
    let cardOpacity = getComputedStyle(card).opacity;
    for (let move of this.#moves ?? []) move.cancel();

    // Offset sizes ignore transforms, so these hold for a lifted card.
    let cardBox = cardImage.getBoundingClientRect();
    let sectionBox = section.getBoundingClientRect();
    let bodyBox = body.getBoundingClientRect();
    let bodyCenter = {
      x: bodyBox.left + bodyBox.width / 2,
      y: bodyBox.top + bodyBox.height / 2,
    };
    let dx = cardBox.left + cardBox.width / 2 - bodyCenter.x;
    let dy = cardBox.top + cardBox.height / 2 - bodyCenter.y;
    let scale = cardImage.offsetWidth / body.offsetWidth;
    let atCard = `translate(${dx}px, ${dy}px) scale(${scale})`;

    cardImage.style.visibility = "hidden";
    // Show the image the card already has, so the window is never blank while
    // the viewer's own images load.
    let opening = direction === "open";
    let cardSrc = cardImage.querySelector("img")?.currentSrc;
    let placeholder = body.style.backgroundImage;
    if (opening && cardSrc) {
      body.style.backgroundImage = `url("${cardSrc}")`;
    }
    section.style.transformOrigin = `${bodyCenter.x - sectionBox.left}px ${bodyCenter.y - sectionBox.top}px`;

    let duration = opening ? 220 : 160;
    let animation = section.animate(
      opening
        ? [{ transform: atCard }, { transform: "none" }]
        : [{ transform }, { transform: atCard }],
      opening
        ? { ...spring({ duration, bounce: 0.1 }) }
        : // Stays on the card until the closing navigation removes the window,
          // which also brings the card back.
          { ...spring({ duration, bounce: 0.05 }), fill: "forwards" },
    );

    // The frame being left fades out over the first half of the move; the one
    // being reached fades in quickly ahead of the photo's arrival.
    let windowChrome = [
      { backgroundColor, boxShadow },
      { backgroundColor: "transparent", boxShadow: "none" },
    ];
    let near: KeyframeAnimationOptions = {
      duration: duration / 2,
      easing: "ease-out",
      fill: "both",
    };
    // Fading in waits a little, so the frame doesn't float far from the photo,
    // and is done before the photo lands rather than finishing after it.
    let far = { ...near, delay: duration * 0.2, duration: duration * 0.4 };
    let fades = opening
      ? [
          section.animate([...windowChrome].reverse(), far),
          titlebar.animate([{ opacity: 0 }, { opacity: 1 }], far),
          card.animate([{ opacity: 1 }, { opacity: 0 }], near),
        ]
      : [
          section.animate(windowChrome, near),
          titlebar.animate(
            [{ opacity: titlebarOpacity }, { opacity: 0 }],
            near,
          ),
          card.animate([{ opacity: cardOpacity }, { opacity: 1 }], far),
        ];
    let moves = [animation, ...fades];
    this.#moves = moves;

    let restoreCard = () => {
      cardImage.style.visibility = "";
      for (let fade of fades) fade.cancel();
    };
    if (opening) {
      let reset = () => {
        // A close took over and puts things back itself.
        if (this.#moves !== moves) return;
        restoreCard();
        section.style.transformOrigin = "";
        body.style.backgroundImage = placeholder;
      };
      animation.finished.then(reset, reset);
    }
    return { animation, restoreCard };
  }
}
