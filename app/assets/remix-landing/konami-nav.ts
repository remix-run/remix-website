/** Synced from App while the Konami sequence is partially entered (for nav shortcuts). */
let partialProgress = 0;

export function setKonamiNavProgress(step: number) {
  partialProgress = step;
}

/** While > 0, [B] should not open Blog (Konami may need B as the 9th key). */
export function shouldBlockNavLetterB(): boolean {
  return partialProgress > 0;
}
