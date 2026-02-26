declare module "satori" {
  export type SatoriFont = {
    name: string;
    data: ArrayBuffer;
    weight?: number;
    style?: "normal" | "italic";
  };

  export type SatoriOptions = {
    width: number;
    height: number;
    fonts: SatoriFont[];
  };

  export default function satori(
    element: unknown,
    options: SatoriOptions,
  ): Promise<string>;
}

declare module "*.woff?arraybuffer" {
  let data: ArrayBuffer;
  export default data;
}

declare module "*.png?arraybuffer" {
  let data: ArrayBuffer;
  export default data;
}
