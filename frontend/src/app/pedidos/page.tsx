'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pedidoService } from '@/services/pedidoService';
import { Pedido } from '@/types';
import PedidoModal from '@/components/PedidoModal';

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const data = await pedidoService.listar();
      // Ordenamos para ver el más reciente primero (opcional)
      setPedidos(data.reverse());
    } catch (error) {
      alert("Error cargando pedidos");
    } finally {
      setLoading(false);
    }
  };

  // Función helper para formatear fecha bonita
  const formatearFecha = (fechaIso: string) => {
    return new Date(fechaIso).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <main>
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-pink-600">
          📝 Historial de Pedidos
        </h1>
        <Link 
          href="/pedidos/nuevo" // <--- RUTA QUE CREAREMOS DESPUÉS
          className="bg-pink-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-pink-600 transition"
        >
          + Nuevo Pedido
        </Link>
      </div>

      {/* Si hay un pedido seleccionado, el Modal se muestra automáticamente */}
      <PedidoModal 
        pedido={pedidoSeleccionado} 
        onClose={() => setPedidoSeleccionado(null)} 
      />

      {loading ? <p>Cargando ventas...</p> : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-pink-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N°</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrega</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resumen</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pedidos.map((p) => (
                <tr key={p.idPedido} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    #{p.idPedido}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-700">
                      {formatearFecha(p.fechaEntrega)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-bold text-gray-900">{p.cliente.nombre} {p.cliente.apellido}</div>
                    <div className="text-xs text-gray-400">{p.cliente.telefono}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {/* Renderizamos una lista pequeñita de los items */}
                    <ul className="list-disc list-inside">
                      {p.detalles.map((d, index) => (
                        <li key={index}>
                          <span className="font-medium">{d.cantidad}x {d.producto.nombre}</span>
                          {/* Si tiene opciones (rellenos), las mostramos entre paréntesis */}
                          {d.opciones.length > 0 && (
                            <span className="text-gray-400 text-xs ml-1">
                              ({d.opciones.map(opt => opt.opcionAtributo.nombre).join(', ')})
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-bold text-green-600">
                    $ {p.total.toLocaleString()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => setPedidoSeleccionado(p)}
                      className="text-blue-500 hover:text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded border border-blue-200"
                    >
                      👁️ Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {pedidos.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              No hay pedidos registrados aún. ¡Crea el primero!
            </div>
          )}
        </div>
      )}
    </main>
  );
}