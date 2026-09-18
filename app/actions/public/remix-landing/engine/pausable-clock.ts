export class PausableClock {
  #pausedAt: number | null = null;
  #pausedDuration = 0;

  read(elapsed: number, paused: boolean): number {
    if (paused) {
      this.#pausedAt ??= elapsed;
      return this.#pausedAt - this.#pausedDuration;
    }

    if (this.#pausedAt !== null) {
      this.#pausedDuration += elapsed - this.#pausedAt;
      this.#pausedAt = null;
    }

    return elapsed - this.#pausedDuration;
  }
}
