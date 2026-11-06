export interface ModelData {
  positions: Float32Array;
  colors: Float32Array | null;
}

const PTS_HEADER = 36;
const modelCache = new Map<string, Promise<ModelData>>();

async function fetchModelPoints(url: string): Promise<ModelData> {
  let response = await fetch(url);
  if (!response.ok)
    throw new Error(`Failed to fetch model: ${url} (${response.status})`);

  let buf = await response.arrayBuffer();
  let view = new DataView(buf);

  let magic = String.fromCharCode(
    view.getUint8(0),
    view.getUint8(1),
    view.getUint8(2),
    view.getUint8(3),
  );
  if (magic !== "PTS1") throw new Error(`Unknown model format: ${url}`);

  let count = view.getUint32(4, true);
  let hasColors = (view.getUint32(8, true) & 1) !== 0;

  let minX = view.getFloat32(12, true);
  let minY = view.getFloat32(16, true);
  let minZ = view.getFloat32(20, true);
  let maxX = view.getFloat32(24, true);
  let maxY = view.getFloat32(28, true);
  let maxZ = view.getFloat32(32, true);
  let rangeX = maxX - minX;
  let rangeY = maxY - minY;
  let rangeZ = maxZ - minZ;

  let positions = new Float32Array(count * 3);
  let offset = PTS_HEADER;
  for (let i = 0; i < count; i++) {
    let idx = i * 3;
    let qx = view.getInt16(offset, true);
    offset += 2;
    let qy = view.getInt16(offset, true);
    offset += 2;
    let qz = view.getInt16(offset, true);
    offset += 2;
    positions[idx] = minX + ((qx + 32767) / 65534) * rangeX;
    positions[idx + 1] = minY + ((qy + 32767) / 65534) * rangeY;
    positions[idx + 2] = minZ + ((qz + 32767) / 65534) * rangeZ;
  }

  let colors: Float32Array | null = null;
  if (hasColors) {
    colors = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      colors[i] = view.getUint8(offset) / 255;
      offset++;
    }
  }

  return { positions, colors };
}

export function loadModelPoints(url: string): Promise<ModelData> {
  let cached = modelCache.get(url);
  if (cached) return cached;

  let pending = fetchModelPoints(url).catch((error) => {
    modelCache.delete(url);
    throw error;
  });

  modelCache.set(url, pending);
  return pending;
}
