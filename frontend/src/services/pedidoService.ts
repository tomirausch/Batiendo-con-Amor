import api from '@/utils/api';
import { Pedido, PedidoRequest } from '@/types';

export const pedidoService = {
  // GET /api/pedidos
  listar: async (): Promise<Pedido[]> => {
    const response = await api.get<Pedido[]>('/pedidos');
    return response.data;
  },

  // POST /api/pedidos
  crear: async (pedido: PedidoRequest): Promise<Pedido> => {
    const response = await api.post<Pedido>('/pedidos', pedido);
    return response.data;
  },

  cancelar: async (id: number): Promise<void> => {
    await api.delete(`/pedidos/${id}`);
  }
};