/**
 * Interfaz para la información del usuario principal.
 * Representa la estructura del objeto de sesión o login.
 */
export interface ClientSession {
  name: string;
  imagen: string | null;
  login: boolean;
  rol: 'Client';
  user: UserProfile; // Referencia a la interfaz del perfil de usuario
}
export interface ClientSession2 {
  name: string;
  imagen: string | null;
  login: boolean;
  rol: any;
}

/**
 * Interfaz para el objeto 'user', que contiene todos los detalles del cliente.
 * Cada propiedad tiene su tipo de dato correspondiente (string, number, boolean, etc.).
 */
export interface UserProfile {
  billing_cliente_id: string;
  es_pasaporte: string;
  PersonaComercio_cedulaRuc: string;
  nombres: string;
  apellidos: string;
  razonsocial: string;
  nombre_comercial: string | null;
  direccion: string;
  diasCredito: string;
  pais: string | null;
  ciudad: string | null;
  comentarios: string | null;
  clientetipo_idclientetipo: string;
  descuentomaxporcent: string;
  cupocredito: string;
  email: string;
  telefonos: string;
  celular: string;
  docidentificacion_id: string;
  vendedor_id: string;
  fecha: string;
  usuario: string;
  clave: string;
  cupo_temporal: string;
  tipo_ruc: string;
  descuentotemp: string;
  clase: string | null;
  provincia: string;
  canton: string;
  parroquia: string | null;
  sexo: string | null;
  estado_civil: string | null;
  origen_ingresos: string | null;
  tipo_identificacion: string | null;
  aseguradora_id: string;
  cuenta_gasto: string;
  credito: string;
  id_sector: string;
  estaActivo: string;
  id_nro_poste: string | null;
  codigo_cliente: string | null;
  descuento_valor: string | null;
  edad_cli: string | null;
  fecha_nacimiento_cli: string | null;
  profesion_cli: string | null;
  es_parking: string;
  imagen: string | null;
  fecha_creacion_cli: string | null;
  direccion2: string | null;
  anio_aportacion: string | null;
  fecha_fallecimiento: string | null;
  celular2: string | null;
  categoria_id: string | null;
  telefono2: string | null;
  redsocial_id: string | null;
  actividad_comercial: string | null;
  precio_afilicacion: string | null;
  id_institucion: string | null;
  nombre_aseguradora: string | null;
  nombre_representantelegal: string | null;
  fecha_update: string | null;
  user_update: string | null;
  cedula_representantelegal: string | null;
  referencia_domicilio: string;
  referencia_direccioncomercial: string | null;
  fecha_updateestados: string | null;
  fecha_updateultimopago: string | null;
  essocio: string | null;
  id_recaudador: string | null;
  banco_id: string | null;
  latitud: string | null;
  longitud: string | null;
  email2: string | null;
  fecha_nacimiento_repre: string | null;
  estado: string | null;
  estado_cliente: string;
  app: string;
  client_notificacion: string | null;
  historico: string;
  pertence_comite: string;
  cod_prod_factelectronica: string;
  idclientetipo: string;
  gta_id: string;
  tipo: string;
  descripcion: string | null;
  deleted: string;
  descuento: string;
  default_price: string;
  default_product: string | null;
  fact_lotes: string;
  num_personal: string | null;
  precio: string;
  cta_contable: string | null;
  rol: 'Client';
  nameUser: string;
}