
// constants/app.constants.ts
export const APP_CONSTANTS = {
  STORAGE_KEYS: {
    GRUPO_SUBGRUPO: 'g_s',
    CARRITO: 'carrito',
    CAR_LOCAL: 'carLocal',
    TIPO_CLIENTE: 'tipoCliente'
  },
  WEB_TYPES: {
    NORMAL: 1,
    TALLAS: 2,
    DOS_BD: 3,
    INTERNET: 4
  },
  TIMEOUTS: {
    LOADER_DELAY: 750,
    INIT_DELAY: 1200
  }
} as const;