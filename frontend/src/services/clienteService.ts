import api from '@/utils/api';
import { Cliente, ClienteRequest } from '@/types';

export const clienteService = {
  // Modificamos listar para aceptar el booleano
  listar: async (soloActivos: boolean): Promise<Cliente[]> => {
    const response = await api.get<Cliente[]>(`/clientes?soloActivos=${soloActivos}`);
    return response.data;
  },

  crear: async (cliente: ClienteRequest): Promise<Cliente> => {
    const response = await api.post<Cliente>('/clientes', cliente);
    return response.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/clientes/${id}`);
  },

  activar: async (id: number): Promise<void> => {
    await api.put(`/clientes/${id}/activar`);
  },
  
  actualizar: async (id: number, cliente: ClienteRequest): Promise<Cliente> => {
    const response = await api.put<Cliente>(`/clientes/${id}`, cliente);
    return response.data;
  },
};