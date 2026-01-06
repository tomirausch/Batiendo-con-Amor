// Espejo de tu Cliente.java
export interface Cliente {
  idCliente: number;
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
  activo: boolean;
}

// Espejo de tu Producto.java
export interface Producto {
  idProducto: number;
  nombre: string;
  unidad: string;
  precioBase: number; // En JS los BigDecimal son number
  activo: boolean;
  atributosValidos: Atributo[];
}

// DTO para crear Cliente (sin ID)
export interface ClienteRequest {
  nombre: string;
  apellido: string;
  direccion: string;
  telefono: string;
}

// --- TIPOS DE PEDIDOS (Lectura) ---

export interface OpcionAtributo {
  idAtributo: number;
  idOpcion: number;
  nombre: string;
  precioExtra: number;
  atributo?: Atributo;
}

export interface DetalleOpcion {
  idDetalleOpcion: number;
  precioExtraHistorico: number;
  opcionAtributo: OpcionAtributo;
}

export interface DetallePedido {
  idDetalle: number;
  cantidad: number;
  subtotal: number;
  producto: Producto; // Reutilizamos la interfaz Producto
  opciones: DetalleOpcion[];
}

export interface Pedido {
  idPedido: number;
  fechaEmitido: string; // Vienen como ISO String del backend
  fechaEntrega: string;
  total: number;
  cliente: Cliente; // Reutilizamos la interfaz Cliente
  detalles: DetallePedido[];
  observaciones?: string;
  cancelado: boolean;
  entregado: boolean;
  pagado: boolean;
}

// --- TIPOS DE PEDIDO (Escritura / Crear) ---

export interface DetalleRequest {
  idProducto: number;
  cantidad: number;
  idsOpciones: number[];
}

export interface PedidoRequest {
  idCliente: number;
  fechaEntrega: string; // YYYY-MM-DD
  detalles: DetalleRequest[];
  observaciones: string;
}

// Agrega esto en src/types/index.ts
export interface Atributo {
  idAtributo: number;
  nombre: string;
}

// Actualiza tu interfaz de creación de Opcion (si no la tenías así)
export interface OpcionRequest {
  nombre: string;
  precioExtra: number;
  idAtributo: number; // Necesitamos saber a qué categoría pertenece
}

export interface Gasto {
  idGasto: number;
  descripcion: string;
  monto: number;
  fecha: string; // YYYY-MM-DD
}

// Para el formulario
export interface GastoRequest {
  descripcion: string;
  monto: number;
  fecha: string;
}