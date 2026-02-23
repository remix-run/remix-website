export declare function createRequestHandler(
  build: unknown,
  env: string | undefined,
): (request: Request) => Promise<Response>;
