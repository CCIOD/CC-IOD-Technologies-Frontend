/**
 * Infiere el código de estado (CDMX, EDOMEX, OAX, etc.) a partir de campos
 * libres como residence_area o court_name. Espejo de la lógica del backend
 * (src/services/folio.service.ts) para que la UI y el folio coincidan.
 */
export interface StateOption {
  code: string;
  label: string;
}

const STATES: { pattern: RegExp; code: string; label: string }[] = [
  { pattern: /edo(?:\.|mex)?|estado de m[eé]xico/i, code: "EDOMEX", label: "Estado de México" },
  { pattern: /cdmx|ciudad de m[eé]xico|d\.?f\.?/i, code: "CDMX", label: "Ciudad de México" },
  { pattern: /oaxaca/i, code: "OAX", label: "Oaxaca" },
  { pattern: /puebla/i, code: "PUE", label: "Puebla" },
  { pattern: /morelos/i, code: "MOR", label: "Morelos" },
  { pattern: /guerrero/i, code: "GRO", label: "Guerrero" },
  { pattern: /jalisco/i, code: "JAL", label: "Jalisco" },
  { pattern: /quer[eé]taro/i, code: "QRO", label: "Querétaro" },
  { pattern: /nuevo le[oó]n/i, code: "NL", label: "Nuevo León" },
  { pattern: /veracruz/i, code: "VER", label: "Veracruz" },
  { pattern: /chiapas/i, code: "CHIS", label: "Chiapas" },
  { pattern: /yucat[aá]n/i, code: "YUC", label: "Yucatán" },
  { pattern: /quintana roo/i, code: "QROO", label: "Quintana Roo" },
  { pattern: /tabasco/i, code: "TAB", label: "Tabasco" },
  { pattern: /guanajuato/i, code: "GTO", label: "Guanajuato" },
  { pattern: /michoac[aá]n/i, code: "MICH", label: "Michoacán" },
];

export const UNKNOWN_STATE: StateOption = { code: "OTRO", label: "Otro / sin estado" };

export const inferStateCode = (...sources: (string | null | undefined)[]): StateOption => {
  for (const source of sources) {
    if (!source) continue;
    for (const s of STATES) {
      if (s.pattern.test(source)) return { code: s.code, label: s.label };
    }
  }
  return UNKNOWN_STATE;
};

export const ALL_STATES: StateOption[] = STATES.map(({ code, label }) => ({ code, label }));
