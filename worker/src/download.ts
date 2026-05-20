import * as fs from 'fs/promises';
import * as path from 'path';

/** Fetch a URL to a local file under `dir`, returning the absolute path. */
export async function download(url: string, dir: string, filename: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`download ${res.status} ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const dest = path.join(dir, filename);
  await fs.writeFile(dest, buf);
  return dest;
}
