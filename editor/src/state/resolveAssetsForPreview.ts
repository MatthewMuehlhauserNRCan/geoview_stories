import { assetIdFromRef, getAsset, isAssetRef } from './assetStore';

/**
 * Walks a plain JSON-like value, replacing every `asset:<id>` string with a fresh blob: URL from
 * IndexedDB - used only to build the live preview's config, never the draft/exported config
 * itself (which keeps the stable `asset:<id>` reference). `createdUrls` collects every blob: URL
 * minted this way so the caller can revoke them once the preview that used them is torn down.
 */
export const resolveAssetRefs = async <T,>(value: T, createdUrls: string[]): Promise<T> => {
  if (isAssetRef(value)) {
    const stored = await getAsset(assetIdFromRef(value));
    if (!stored) return value;
    const url = URL.createObjectURL(stored.blob);
    createdUrls.push(url);
    return url as unknown as T;
  }
  if (Array.isArray(value)) {
    return (await Promise.all(value.map((v) => resolveAssetRefs(v, createdUrls)))) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const entries = await Promise.all(
      Object.entries(value as Record<string, unknown>).map(async ([k, v]) => [k, await resolveAssetRefs(v, createdUrls)] as const)
    );
    return Object.fromEntries(entries) as T;
  }
  return value;
};
