import api from '@/utils/api';
import { Gasto, GastoRequest } from '@/types';

export const gastoService = {
  listar: async (): Promise<Gasto[]> => {
    const response = await api.get<Gasto[]>('/gastos');
    return response.data;
  },

  crear: async (gasto: GastoRequest): Promise<Gasto> => {
    const response = await api.post<Gasto>('/gastos', gasto);
    return response.data;
  },

  eliminar: async (id: number): Promise<void> => {
    await api.delete(`/gastos/${id}`);
  }
};