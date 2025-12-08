import api from '@/utils/api';
import { Producto } from '@/types';

// Definimos la interfaz para crear (sin ID)
export interface ProductoRequest {
  nombre: string;
  unidad: string;
  precioBase: number;
  idsAtributosValidos: number[];
}

export const productoService = {
  // GET /api/productos (traemos todos, incluso los inactivos para que tu mamá gestione)
  listar: async (soloActivos: boolean = false): Promise<Producto[]> => {
    // Le mandamos soloActivos=false para ver el inventario completo
    const response = await api.get<Producto[]>('/productos?soloActivos=false');
    return response.data;
  },

  // POST /api/productos
  crear: async (producto: ProductoRequest): Promise<Producto> => {
    const response = await api.post<Producto>('/productos', producto);
    return response.data;
  },

  // DELETE /api/productos/{id}
  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/productos/${id}`);
  },
  
  // PUT /api/productos/{id} (Para editar precio)
  actualizar: async (id: number, producto: ProductoRequest): Promise<Producto> => {
    const response = await api.put<Producto>(`/productos/${id}`, producto);
    return response.data;
  },

  activar: async (id: number): Promise<void> => {
    await api.put(`/productos/${id}/activar`);
  }
};