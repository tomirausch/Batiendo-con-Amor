'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clienteService } from '@/services/clienteService';
import { productoService } from '@/services/productoService';
import { opcionService } from '@/services/opcionService';
import { pedidoService } from '@/services/pedidoService';
import { Cliente, Producto, OpcionAtributo, DetalleRequest } from '@/types';
import AlertModal from '@/components/AlertModal'; // <--- IMPORTANTE

export default function NuevoPedidoPage() {
  const router = useRouter();

  // --- ESTADO DEL MODAL CON REDIRECCIÓN ---
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'confirm';
    title: string;
    message: string;
    onCloseAction?: () => void; // Acción extra al cerrar (ej: navegar)
  }>({ isOpen: false, type: 'success', title: '', message: '' });

  // Helpers
  const showError = (msg: string) => setAlertConfig({ isOpen: true, type: 'error', title: 'Atención', message: msg });
  const showSuccess = (msg: string, afterClose?: () => void) =>
    setAlertConfig({ isOpen: true, type: 'success', title: '¡Listo!', message: msg, onCloseAction: afterClose });

  const closeAlert = () => {
    const action = alertConfig.onCloseAction;
    setAlertConfig(prev => ({ ...prev, isOpen: false, onCloseAction: undefined }));
    if (action) action(); // Ejecutar navegación si existe
  };

  // --- DATOS DEL SISTEMA ---
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [opcionesDisponibles, setOpcionesDisponibles] = useState<OpcionAtributo[]>([]);
  const [observaciones, setObservaciones] = useState('');
  const [idCliente, setIdCliente] = useState<number | ''>('');
  const [fechaEntrega, setFechaEntrega] = useState('');

  const [carrito, setCarrito] = useState<{
    tempId: number;
    producto: Producto;
    cantidad: number;
    idsOpciones: number[];
  }[]>([]);

  // Fecha helper
  const getFechaHoy = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [cli, prod, opt] = await Promise.all([
          clienteService.listar(true),
          productoService.listar(true),
          opcionService.listar()
        ]);
        setClientes(cli);
        setProductos(prod);
        setOpcionesDisponibles(opt);
      } catch (error) {
        console.error(error);
      }
    };
    cargarDatos();
  }, []);

  const agregarProducto = (idProducto: string) => {
    const prod = productos.find(p => p.idProducto === parseInt(idProducto));
    if (!prod) return;
    setCarrito([...carrito, { tempId: Date.now(), producto: prod, cantidad: 1, idsOpciones: [] }]);
  };

  const toggleOpcion = (tempId: number, idOpcion: number) => {
    setCarrito(prev => prev.map(item => {
      if (item.tempId !== tempId) return item;
      const idNum = Number(idOpcion);
      const nuevas = item.idsOpciones.includes(idNum)
        ? item.idsOpciones.filter(id => id !== idNum)
        : [...item.idsOpciones, idNum];
      return { ...item, idsOpciones: nuevas };
    }));
  };

  const eliminarItem = (tempId: number) => {
    setCarrito(carrito.filter(item => item.tempId !== tempId));
  };

  const procesarPedido = async () => {
    if (!idCliente) return showError("⚠️ Por favor, seleccione un cliente.");
    if (!fechaEntrega) return showError("⚠️ Por favor, seleccione una fecha.");
    if (fechaEntrega < getFechaHoy()) return showError("⚠️ La fecha de entrega no puede ser anterior a hoy.");
    if (carrito.length === 0) return showError("⚠️ Realice al menos un pedido.");

    const detalles: DetalleRequest[] = carrito.map(item => ({
      idProducto: item.producto.idProducto,
      cantidad: item.cantidad,
      idsOpciones: item.idsOpciones
    }));

    try {
      await pedidoService.crear({
        idCliente: Number(idCliente),
        fechaEntrega,
        observaciones,
        detalles
      });

      // Mostrar éxito y redirigir al cerrar el modal
      showSuccess("¡Pedido creado con éxito!", () => router.push('/pedidos'));

    } catch (error) {
      console.error(error);
      showError("Error al crear el pedido. Verifica los datos.");
    }
  };

  const totalEstimado = carrito.reduce((acc, item) => {
    const precioBase = item.producto.precioBase * item.cantidad;
    const precioOpciones = item.idsOpciones.reduce((sumOpt, idOpt) => {
      const opt = opcionesDisponibles.find(o => o.idOpcion === idOpt);
      return sumOpt + (opt ? opt.precioExtra : 0);
    }, 0) * item.cantidad;
    return acc + precioBase + precioOpciones;
  }, 0);

  return (
    <main className="pb-20 relative">
      <AlertModal
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={closeAlert}
      />

      <h1 className="text-3xl font-bold mb-6 text-pink-600">Nuevo Pedido</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- COLUMNA IZQUIERDA --- */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow border border-pink-100">
            <h2 className="text-lg font-bold mb-4 text-gray-700">1. Datos del Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Cliente</label>
                <select
                  className="w-full border p-2 rounded mt-1 bg-white"
                  value={idCliente}
                  onChange={e => setIdCliente(Number(e.target.value))}
                >
                  <option value="">-- Seleccionar Cliente --</option>
                  {clientes.map(c => (
                    <option key={c.idCliente} value={c.idCliente}>{c.nombre} {c.apellido}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha Entrega</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded mt-1"
                  value={fechaEntrega}
                  min={getFechaHoy()} // Bloqueo visual
                  onChange={e => setFechaEntrega(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border border-pink-100">
            <h2 className="text-lg font-bold mb-4 text-gray-700">2. Armar Pedido</h2>
            <div className="flex gap-4">
              <select
                className="flex-1 border p-2 rounded bg-white"
                onChange={(e) => {
                  if (e.target.value) {
                    agregarProducto(e.target.value);
                    e.target.value = "";
                  }
                }}
              >
                <option value="">+ Agregar Producto al Carrito...</option>
                {productos.map(p => (
                  <option key={p.idProducto} value={p.idProducto}>{p.nombre} (${p.precioBase})</option>
                ))}
              </select>
            </div>

            <div className="mt-6 space-y-4">
              {carrito.map((item) => (
                <div key={item.tempId} className="border rounded-lg p-4 bg-gray-50 relative">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{item.producto.nombre}</h3>
                      <p className="text-pink-600 font-semibold">${item.producto.precioBase}</p>
                    </div>
                    <button onClick={() => eliminarItem(item.tempId)} className="text-red-500 hover:text-red-700 font-bold">X</button>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <label className="text-sm">Cantidad:</label>
                    <input
                      type="number" min="1"
                      className="w-16 border p-1 rounded"
                      value={item.cantidad}
                      onChange={e => {
                        const nuevaCant = parseInt(e.target.value);
                        setCarrito(carrito.map(i => i.tempId === item.tempId ? { ...i, cantidad: nuevaCant } : i));
                      }}
                    />
                  </div>

                  <div className="mt-3 border-t pt-2">
                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Agregados Disponibles:</p>
                    <div className="flex flex-wrap gap-2">
                      {opcionesDisponibles.filter(op => {
                        if (!item.producto.atributosValidos?.length) return true;
                        const catId = op.atributo?.idAtributo || (op as any).idAtributo;
                        return !catId || item.producto.atributosValidos.some(attr => attr.idAtributo === catId);
                      }).map(op => (
                        <label key={op.idOpcion} className={`flex items-center gap-2 text-sm border px-3 py-2 rounded cursor-pointer transition-all select-none ${item.idsOpciones.includes(op.idOpcion) ? 'bg-pink-100 border-pink-300 text-pink-800 font-medium' : 'bg-white border-gray-200 hover:border-pink-300'}`}>
                          <input
                            type="checkbox"
                            className="accent-pink-500 w-4 h-4"
                            checked={item.idsOpciones.includes(op.idOpcion)}
                            onChange={() => toggleOpcion(item.tempId, op.idOpcion)}
                          />
                          <span>{op.nombre}</span>
                          <span className="text-gray-400 text-xs ml-1">(+${op.precioExtra})</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
              {carrito.length === 0 && <p className="text-center text-gray-400 py-4">El carrito está vacío</p>}
            </div>
          </div>
        </div>

        {/* --- COLUMNA DERECHA --- */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-lg border-t-4 border-pink-500 sticky top-4">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Resumen</h2>
            <div className="space-y-2 mb-4 text-sm text-gray-600">
              <div className="flex justify-between"><span>Items:</span><span>{carrito.length}</span></div>
              <div className="flex justify-between"><span>Cliente:</span><span>{clientes.find(c => c.idCliente === Number(idCliente))?.nombre || '-'}</span></div>
              <div className="flex justify-between"><span>Entrega:</span><span>{fechaEntrega || '-'}</span></div>
            </div>
            <div className="border-t pt-4 mt-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-gray-600">Total Estimado:</span>
                <span className="text-3xl font-bold text-pink-600">${totalEstimado.toLocaleString()}</span>
              </div>
            </div>
            <div className="mt-4 mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones / Dedicatoria:</label>
              <textarea
                className="w-full border p-2 rounded text-sm h-20 resize-none"
                placeholder="Ej: Escribir 'Feliz Día' en chocolate..."
                value={observaciones}
                onChange={e => setObservaciones(e.target.value)}
              />
            </div>
            <button
              onClick={procesarPedido}
              disabled={carrito.length === 0 || !idCliente}
              className="w-full mt-6 bg-pink-600 text-white font-bold py-3 rounded-lg hover:bg-pink-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Confirmar Pedido
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}