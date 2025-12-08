import api from '@/utils/api';
import { OpcionAtributo, Atributo, OpcionRequest } from '@/types'; // Importa las nuevas interfaces

export const opcionService = {
  // Traer todas las opciones (Nutella, DDL, etc.)
  listar: async (): Promise<OpcionAtributo[]> => {
    const response = await api.get<OpcionAtributo[]>('/opciones');
    return response.data;
  },

  // NUEVO: Traer las categorías (Relleno, Decoración...)
  listarAtributos: async (): Promise<Atributo[]> => {
    const response = await api.get<Atributo[]>('/atributos');
    return response.data;
  },

  // Crear una nueva opción
  crear: async (opcion: OpcionRequest): Promise<OpcionAtributo> => {
    const response = await api.post<OpcionAtributo>('/opciones', opcion);
    return response.data;
  },
  
  // Actualizar precio
  actualizar: async (id: number, opcion: OpcionRequest): Promise<OpcionAtributo> => {
    const response = await api.put<OpcionAtributo>(`/opciones/${id}`, opcion);
    return response.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/opciones/${id}`);
  },

  crearAtributo: async (nombre: string): Promise<Atributo> => {
    // Enviamos un objeto con la propiedad nombre
    const response = await api.post<Atributo>('/atributos', { nombre });
    return response.data;
  }
};