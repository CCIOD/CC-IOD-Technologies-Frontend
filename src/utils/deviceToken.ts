/**
 * Identificador único del navegador/equipo, persistido en localStorage.
 *
 * Lo emitimos al primer load y lo enviamos en el header `X-Device-Id` en cada
 * request. El backend valida contra AUTHORIZED_DEVICES; si está registrado,
 * el usuario puede entrar incluso si la IP no está en la whitelist (modelo OR).
 *
 * Es un valor opaco: el backend no lo interpreta, solo lo compara. Si el
 * usuario borra localStorage o cambia de navegador, se genera uno nuevo y
 * el Admin tendrá que volver a registrar el equipo.
 */
const STORAGE_KEY = 'cciod_device_id';

const generateToken = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback para navegadores antiguos
  return 'dev-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
};

export const getOrCreateDeviceToken = (): string => {
  let token = localStorage.getItem(STORAGE_KEY);
  if (!token) {
    token = generateToken();
    localStorage.setItem(STORAGE_KEY, token);
  }
  return token;
};

/** Útil para mostrarlo en la UI de provisionamiento sin forzar su creación. */
export const getDeviceTokenIfExists = (): string | null =>
  localStorage.getItem(STORAGE_KEY);

/** Solo se debería llamar desde un flujo de "des-provisionar este equipo". */
export const resetDeviceToken = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
