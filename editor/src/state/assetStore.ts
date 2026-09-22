const DB_NAME = 'geoview-story-editor';
const STORE_NAME = 'assets';
const DB_VERSION = 1;

export interface StoredAsset {
  id: string;
  name: string;
  type: string;
  blob: Blob;
}

let dbPromise: Promise<IDBDatabase> | null = null;

const openDb = (): Promise<IDBDatabase> => {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE_NAME, { keyPath: 'id' });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
};

const runTx = <T,>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> =>
  openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, mode);
        const req = run(tx.objectStore(STORE_NAME));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      })
  );

/** Persists a picked File in IndexedDB (survives reloads, unlike a plain blob: URL) and returns its asset id. */
export const saveAsset = (file: File): Promise<string> => saveAssetBlob(file, file.name, file.type);

/** Lower-level variant for rehydrating an asset from a zip's raw entry bytes, not a real File. */
export const saveAssetBlob = async (blob: Blob, name: string, type: string): Promise<string> => {
  const id = `a${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  await runTx('readwrite', (store) => store.put({ id, name, type, blob } satisfies StoredAsset));
  return id;
};

export const getAsset = (id: string): Promise<StoredAsset | undefined> => runTx('readonly', (store) => store.get(id));

export const deleteAsset = (id: string): Promise<undefined> => runTx('readwrite', (store) => store.delete(id));

// A stable, exportable-JSON-safe reference to a file stored in IndexedDB. Two kinds share the same
// storage but are resolved differently by the live preview: `asset:` (images/video/markdown) is
// swapped for a real blob: URL so it actually renders; `mapconfig:` (a linked GeoView map config)
// is deliberately left as-is - GeoView map configs are a whole separate schema this editor doesn't
// author, so the map panel just keeps showing its own "loading" placeholder, same as an empty/
// placeholder path, while still letting the field show which file is attached.
const PREFIXES = { asset: 'asset:', mapconfig: 'mapconfig:' } as const;
export type AssetRefKind = keyof typeof PREFIXES;

export const isRefOfKind = (value: unknown, kind: AssetRefKind): value is string =>
  typeof value === 'string' && value.startsWith(PREFIXES[kind]);
export const makeRef = (kind: AssetRefKind, id: string): string => `${PREFIXES[kind]}${id}`;
export const idFromRef = (ref: string): string => ref.slice(ref.indexOf(':') + 1);

export const isAssetRef = (value: unknown): value is string => isRefOfKind(value, 'asset');
export const assetRef = (id: string): string => makeRef('asset', id);
export const assetIdFromRef = idFromRef;
