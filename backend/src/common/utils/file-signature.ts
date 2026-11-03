import { open } from 'fs/promises';

const startsWith = (buf: Buffer, bytes: number[], offset = 0) => bytes.every((b, i) => buf[offset + i] === b);

const isJpeg = (b: Buffer) => startsWith(b, [0xff, 0xd8, 0xff]);
const isPng = (b: Buffer) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const isWebp = (b: Buffer) => startsWith(b, [0x52, 0x49, 0x46, 0x46]) && startsWith(b, [0x57, 0x45, 0x42, 0x50], 8);
const isPdf = (b: Buffer) => startsWith(b, [0x25, 0x50, 0x44, 0x46, 0x2d]);
const isIsoVideo = (b: Buffer) => startsWith(b, [0x66, 0x74, 0x79, 0x70], 4);
const isWebm = (b: Buffer) => startsWith(b, [0x1a, 0x45, 0xdf, 0xa3]);

export type FileKind = 'image' | 'document' | 'video';

const CHECKS: Record<FileKind, ((b: Buffer) => boolean)[]> = {
  image: [isJpeg, isPng, isWebp],
  document: [isJpeg, isPng, isWebp, isPdf],
  video: [isIsoVideo, isWebm],
};

/** Reads the first bytes of a saved file and confirms they match the kind of upload expected. */
export const matchesSignature = async (path: string, kind: FileKind): Promise<boolean> => {
  const handle = await open(path, 'r');
  try {
    const buf = Buffer.alloc(16);
    await handle.read(buf, 0, 16, 0);
    return CHECKS[kind].some((check) => check(buf));
  } finally {
    await handle.close();
  }
};
