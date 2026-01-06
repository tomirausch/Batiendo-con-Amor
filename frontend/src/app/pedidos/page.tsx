'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { pedidoService } from '@/services/pedidoService';
import { Pedido } from '@/types';
import PedidoModal from '@/components/PedidoModal';
import AlertModal from '@/components/AlertModal';

export default function PedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  // ESTADO PARA EL ORDENAMIENTO
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'entrega', direction: 'desc' });

  // --- ESTADO DEL MODAL ---
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    onConfirm?: () => void;
  }>({ isOpen: false, type: 'success', title: '', message: '' });

  // --- HELPERS DEL MODAL ---
  const showError = (msg: string) => setAlertConfig({ isOpen: true, type: 'error', title: 'Error', message: msg });
  const showConfirm = (msg: string, onConfirm: () => void) => setAlertConfig({ isOpen: true, type: 'confirm', title: '¿Estás seguro?', message: msg, onConfirm });
  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      const data = await pedidoService.listar();
      setPedidos(data); // Guardamos los datos crudos, el ordenamiento se hace en el render
    } catch (error) {
      showError("Error cargando pedidos");
    } finally {
      setLoading(false);
    }
  };

  const formatearFecha = (fechaIso: string) => {
    return new Date(fechaIso).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  // --- LÓGICA DE ORDENAMIENTO ---
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    // Si ya estamos ordenando por esta columna y es ascendente, cambiamos a descendente
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const pedidosOrdenados = [...pedidos].sort((a, b) => {
    const { key, direction } = sortConfig;
    let comparison = 0;

    if (key === 'entrega') {
      const fechaA = new Date(a.fechaEntrega).getTime();
      const fechaB = new Date(b.fechaEntrega).getTime();
      comparison = fechaA - fechaB;
    } else if (key === 'cliente') {
      const nombreA = `${a.cliente.nombre} ${a.cliente.apellido}`.toLowerCase();
      const nombreB = `${b.cliente.nombre} ${b.cliente.apellido}`.toLowerCase();
      comparison = nombreA.localeCompare(nombreB);
    } else if (key === 'id') {
      comparison = a.idPedido - b.idPedido;
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  // Helper para mostrar la flechita
  const getSortIcon = (columnKey: string) => {
    if (sortConfig.key !== columnKey) return <span className="text-gray-300 ml-1">↕</span>;
    return sortConfig.direction === 'asc' ? <span className="ml-1 text-pink-600">⬆</span> : <span className="ml-1 text-pink-600">⬇</span>;
  };

  return (
    <main>
      <AlertModal
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
      />
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-3xl font-bold text-pink-600">
          📝 Historial de Pedidos
        </h1>
        <Link
          href="/pedidos/nuevo"
          className="bg-pink-500 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-pink-600 transition"
        >
          + Nuevo Pedido
        </Link>
      </div>

      <PedidoModal
        pedido={pedidoSeleccionado}
        onClose={() => setPedidoSeleccionado(null)}
      />

      {loading ? <p>Cargando ventas...</p> : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-pink-50 select-none">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-pink-100 transition"
                  onClick={() => handleSort('id')}
                >
                  N° {getSortIcon('id')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-pink-100 transition"
                  onClick={() => handleSort('entrega')}
                >
                  Entrega {getSortIcon('entrega')}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase cursor-pointer hover:bg-pink-100 transition"
                  onClick={() => handleSort('cliente')}
                >
                  Cliente {getSortIcon('cliente')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resumen</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Pago</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pedidosOrdenados.map((p) => {
                const now = new Date();
                const fechaEntrega = new Date(p.fechaEntrega);

                // Determinamos estado
                let estadoLabel = <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-sm font-bold">Pendiente</span>;
                let isAtrasado = false;

                if (p.cancelado) {
                  estadoLabel = <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-sm font-bold">CANCELADO</span>;
                } else if (p.entregado) {
                  estadoLabel = <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-sm font-bold">ENTREGADO</span>;
                } else if (fechaEntrega < now) {
                  // Si no está entregado, ni cancelado, y ya pasó la fecha
                  isAtrasado = true;
                  estadoLabel = <span className="text-orange-600 bg-orange-100 px-2 py-1 rounded text-sm font-bold">ATRASADO</span>;
                }

                return (
                  <tr key={p.idPedido} className={`hover:bg-gray-50 ${p.cancelado ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      #{p.idPedido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-medium ${isAtrasado ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
                        {formatearFecha(p.fechaEntrega)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{p.cliente.nombre} {p.cliente.apellido}</div>
                      <div className="text-xs text-gray-400">{p.cliente.telefono}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <ul className="list-disc list-inside">
                        {p.detalles.map((d, index) => (
                          <li key={index}>
                            <span className="font-medium">{d.cantidad}x {d.producto.nombre}</span>
                            {d.opciones.length > 0 && (
                              <span className="text-gray-400 text-xs ml-1">
                                ({d.opciones.map(opt => opt.opcionAtributo.nombre).join(', ')})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {estadoLabel}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {p.pagado ? (
                        <span className="text-green-600 bg-green-50 border border-green-200 px-2 py-1 rounded text-xs font-bold">PAGADO</span>
                      ) : (
                        <span className="text-gray-500 bg-gray-100 border border-gray-200 px-2 py-1 rounded text-xs font-bold">PENDIENTE</span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-lg font-bold text-green-600">
                      <span className="text-green-600">$ {p.total.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        {!p.cancelado && !p.entregado && (
                          <button
                            onClick={() => {
                              showConfirm('¿Marcar pedido como ENTREGADO?', async () => {
                                try {
                                  await pedidoService.entregar(p.idPedido);
                                  cargarPedidos();
                                } catch (e) {
                                  showError("No se pudo marcar como entregado");
                                }
                              });
                            }}
                            className="text-green-600 hover:text-green-800 font-bold bg-green-50 px-3 py-1 rounded border border-green-200"
                            title="Marcar como Entregado"
                          >
                            ✔
                          </button>
                        )}

                        {!p.cancelado && !p.pagado && (
                          <button
                            onClick={() => {
                              showConfirm('¿Confirmar que el pedido fue PAGADO?', async () => {
                                try {
                                  await pedidoService.pagar(p.idPedido);
                                  cargarPedidos();
                                } catch (e) {
                                  showError("No se pudo registrar el pago");
                                }
                              });
                            }}
                            className="text-green-600 hover:text-green-800 font-bold bg-green-50 px-3 py-1 rounded border border-green-200"
                            title="Registrar Pago"
                          >
                            💲
                          </button>
                        )}

                        <button
                          onClick={() => setPedidoSeleccionado(p)}
                          className="text-blue-500 hover:text-blue-700 font-bold bg-blue-50 px-3 py-1 rounded border border-blue-200"
                        >
                          👁️
                        </button>

                        {!p.cancelado && !p.entregado && (
                          <button
                            onClick={() => {
                              showConfirm('¿Seguro que quieres CANCELAR este pedido?', async () => {
                                try {
                                  await pedidoService.cancelar(p.idPedido);
                                  cargarPedidos();
                                } catch (e) {
                                  showError("No se pudo cancelar el pedido");
                                }
                              });
                            }}
                            className="text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-1 rounded border border-red-200"
                            title="Cancelar Pedido"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
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