import { Pedido } from "@/types";

interface Props {
  pedido: Pedido | null;
  onClose: () => void;
}

export default function PedidoModal({ pedido, onClose }: Props) {
  if (!pedido) return null; // Si no hay pedido seleccionado, no mostramos nada

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-fade-in">
        
        {/* ENCABEZADO */}
        <div className="bg-pink-500 p-4 flex justify-between items-center sticky top-0">
          <h2 className="text-white font-bold text-lg">Detalle del Pedido #{pedido.idPedido}</h2>
          <button onClick={onClose} className="text-white hover:text-pink-200 font-bold text-2xl">
            &times;
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* DATOS GENERALES */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500 font-bold uppercase">Cliente</p>
              <p className="text-lg">{pedido.cliente.nombre} {pedido.cliente.apellido}</p>
              <p className="text-gray-600">{pedido.cliente.telefono}</p>
              <p className="text-gray-600">{pedido.cliente.direccion}</p>
            </div>
            <div className="text-right">
              <p className="text-gray-500 font-bold uppercase">Fecha de Entrega</p>
              <p className="text-lg font-medium text-pink-600">
                {new Date(pedido.fechaEntrega).toLocaleDateString('es-AR', { dateStyle: 'full' })}
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Emitido: {new Date(pedido.fechaEmitido).toLocaleDateString('es-AR')}
              </p>
            </div>
          </div>

          <hr />

          {/* LISTA DE PRODUCTOS */}
          <div>
            <h3 className="font-bold text-gray-700 mb-2">Productos Solicitados</h3>
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              {pedido.detalles.map((d, index) => (
                <div key={index} className="flex justify-between items-start border-b border-gray-200 last:border-0 pb-2 last:pb-0">
                  <div>
                    <span className="font-bold text-gray-800">{d.cantidad}x {d.producto.nombre}</span>
                    <div className="text-sm text-gray-500 ml-4">
                      {d.opciones.length > 0 ? (
                        <ul className="list-disc">
                          {d.opciones.map(op => (
                            <li key={op.idDetalleOpcion}>
                              {op.opcionAtributo.nombre} <span className="text-xs text-gray-400">(+${op.precioExtraHistorico})</span>
                            </li>
                          ))}
                        </ul>
                      ) : <span className="text-xs italic">Sin agregados</span>}
                    </div>
                  </div>
                  <span className="font-medium text-gray-700">${d.subtotal.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* OBSERVACIONES */}
          {pedido.observaciones && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <p className="font-bold text-yellow-700 text-xs uppercase mb-1">⚠️ Observaciones:</p>
              <p className="text-gray-700 italic">"{pedido.observaciones}"</p>
            </div>
          )}

          {/* TOTAL FINAL */}
          <div className="flex justify-end items-center pt-4 border-t">
            <span className="text-xl font-bold text-gray-800 mr-4">TOTAL:</span>
            <span className="text-3xl font-bold text-pink-600 bg-pink-50 px-4 py-1 rounded">
              $ {pedido.total.toLocaleString()}
            </span>
          </div>
        </div>

        <div className="bg-gray-100 p-4 flex justify-end">
          <button 
            onClick={onClose}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}