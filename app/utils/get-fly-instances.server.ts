import { resolve6 } from "dns/promises";

async function getFlyInstances(): Promise<string[]> {
  let address = `global.${process.env.FLY_APP_NAME}.internal`;
  let ipv6s = await resolve6(address);
  return ipv6s.map((ip) => `http://[${ip}]:8080`);
}

export { getFlyInstances };
