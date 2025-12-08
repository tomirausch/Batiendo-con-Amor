'use client';

import { useEffect, useState } from 'react';
import { gastoService } from '@/services/gastoService';
import { pedidoService } from '@/services/pedidoService';
import { Gasto, GastoRequest } from '@/types';

export default function FinanzasPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [ingresos, setIngresos] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const [nuevoGasto, setNuevoGasto] = useState<GastoRequest>({
    descripcion: '',
    monto: 0,
    fecha: new Date().toISOString().split('T')[0]
  });

  const cargarDatos = async () => {
    try {
      const [listaGastos, listaPedidos] = await Promise.all([
        gastoService.listar(),
        pedidoService.listar()
      ]);

      setGastos(listaGastos.reverse());

      // --- CAMBIO AQUÍ: Sumar solo pedidos NO cancelados ---
      const totalVentas = listaPedidos.reduce((acc, pedido) => {
        // Si el pedido está cancelado, lo ignoramos (retornamos el acumulador sin sumar)
        if (pedido.cancelado) return acc;

        // Si está activo, sumamos su total
        return acc + (pedido.total || 0);
      }, 0);

      setIngresos(totalVentas);

    } catch (error) {
      alert("Error cargando finanzas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoGasto.descripcion || nuevoGasto.monto <= 0) return alert("Datos inválidos");

    try {
      await gastoService.crear(nuevoGasto);
      setNuevoGasto({ ...nuevoGasto, descripcion: '', monto: 0 });
      cargarDatos();
    } catch (error) {
      alert("Error guardando gasto");
    }
  };

  const handleBorrar = async (id: number) => {
    if (confirm("¿Eliminar este registro de gasto?")) {
      await gastoService.eliminar(id);
      cargarDatos();
    }
  };

  const totalGastos = gastos.reduce((acc, g) => acc + (g.monto || 0), 0);
  const gananciaNeta = ingresos - totalGastos;
  const esRentable = gananciaNeta >= 0;

  return (
    <main className="pb-10">
      <h1 className="text-3xl font-bold mb-6 text-pink-600 border-b pb-2">
        💰 Finanzas y Balance
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
          <p className="text-gray-500 text-sm font-bold uppercase">Total Ventas (Reales)</p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            $ {ingresos.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-red-500">
          <p className="text-gray-500 text-sm font-bold uppercase">Total Gastos</p>
          <p className="text-3xl font-bold text-red-600 mt-1">
            $ {totalGastos.toLocaleString()}
          </p>
        </div>

        <div className={`bg-white p-6 rounded-xl shadow border-l-4 ${esRentable ? 'border-blue-500' : 'border-yellow-500'}`}>
          <p className="text-gray-500 text-sm font-bold uppercase">Ganancia Neta</p>
          <p className={`text-3xl font-bold mt-1 ${esRentable ? 'text-blue-600' : 'text-yellow-600'}`}>
            $ {gananciaNeta.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <div className="bg-white p-6 rounded-lg shadow h-fit border border-pink-100">
          <h2 className="text-lg font-bold mb-4 text-gray-700">Registrar Gasto / Compra</h2>
          <form onSubmit={handleGuardar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <input
                type="text"
                placeholder="Ej: 10kg Harina 0000"
                className="w-full border p-2 rounded mt-1"
                value={nuevoGasto.descripcion}
                onChange={e => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Monto ($)</label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full border p-2 rounded mt-1"
                  value={nuevoGasto.monto}
                  onChange={e => setNuevoGasto({ ...nuevoGasto, monto: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded mt-1"
                  value={nuevoGasto.fecha}
                  onChange={e => setNuevoGasto({ ...nuevoGasto, fecha: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-500 text-white font-bold py-2 rounded hover:bg-red-600 transition"
            >
              - Registrar Egreso
            </button>
          </form>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4 text-gray-700">Historial de Gastos</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {gastos.map((g) => (
                  <tr key={g.idGasto} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(g.fecha).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {g.descripcion}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-red-600 font-bold">
                      - $ {(g.monto || 0).toLocaleString()}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleBorrar(g.idGasto)}
                        className="text-gray-300 hover:text-red-500"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </main>
  );
}