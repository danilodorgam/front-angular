export type StorageKind = 'local' | 'session';

function getStorage(kind: StorageKind): Storage | null {
  try {
    return kind === 'local' ? globalThis.localStorage : globalThis.sessionStorage;
  } catch {
    return null;
  }
}

/** Lê do Web Storage sem quebrar em modo privado, cota excedida ou ambiente sem `window`. */
export function readStorage(key: string, kind: StorageKind = 'local'): string | null {
  try {
    return getStorage(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

/** Grava (ou remove, quando `value` é null) no Web Storage ignorando indisponibilidade. */
export function writeStorage(key: string, value: string | null, kind: StorageKind = 'local'): void {
  try {
    const storage = getStorage(kind);
    if (!storage) {
      return;
    }
    if (value === null) {
      storage.removeItem(key);
    } else {
      storage.setItem(key, value);
    }
  } catch {
    // Armazenamento indisponível: a preferência vale apenas para a sessão atual.
  }
}
