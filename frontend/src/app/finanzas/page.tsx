'use client';

import { useEffect, useState, useMemo } from 'react';
import * as XLSX from 'xlsx'; // Importamos la librería de Excel
import { gastoService } from '@/services/gastoService';
import { pedidoService } from '@/services/pedidoService';
import { Gasto, GastoRequest, Pedido } from '@/types';
import AlertModal from '@/components/AlertModal';

// Tipos para el reporte
type Agrupacion = 'dia' | 'mes' | 'anio';
interface FilaReporte {
  fecha: string;
  ingresos: number;
  egresos: number;
  balance: number;
}

export default function FinanzasPage() {
  // --- ESTADOS DE DATOS ---
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ESTADOS DEL FILTRO ---
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [agrupacion, setAgrupacion] = useState<Agrupacion>('dia');

  // --- ESTADO DEL FORMULARIO Y MODAL ---
  const [nuevoGasto, setNuevoGasto] = useState<GastoRequest>({
    descripcion: '', monto: 0, fecha: new Date().toISOString().split('T')[0]
  });

  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean; type: 'success' | 'error' | 'confirm'; title: string; message: string; onConfirm?: () => void;
  }>({ isOpen: false, type: 'success', title: '', message: '' });

  // Helpers Modal
  const showError = (msg: string) => setAlertConfig({ isOpen: true, type: 'error', title: 'Error', message: msg });
  const showSuccess = (msg: string) => setAlertConfig({ isOpen: true, type: 'success', title: 'Éxito', message: msg });
  const showConfirm = (msg: string, onConfirm: () => void) => setAlertConfig({ isOpen: true, type: 'confirm', title: 'Confirmar', message: msg, onConfirm });
  const closeAlert = () => setAlertConfig(prev => ({ ...prev, isOpen: false }));

  // --- CARGA INICIAL ---
  const cargarDatos = async () => {
    try {
      const [listaGastos, listaPedidos] = await Promise.all([
        gastoService.listar(),
        pedidoService.listar()
      ]);
      setGastos(listaGastos);
      setPedidos(listaPedidos);

      // Configurar fechas por defecto (Mes actual)
      const hoy = new Date();
      const primerDia = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
      const ultimoDia = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).toISOString().split('T')[0];

      if (!fechaDesde) setFechaDesde(primerDia);
      if (!fechaHasta) setFechaHasta(ultimoDia);

    } catch (error) {
      console.error(error);
      showError("Error cargando datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  // --- LÓGICA DE FILTRADO Y AGRUPACIÓN (El corazón del reporte) ---
  const datosFiltrados = useMemo(() => {
    if (!fechaDesde || !fechaHasta) return { reporte: [], totalIngresos: 0, totalEgresos: 0, pedidosFiltrados: [], gastosFiltrados: [] };

    const desde = new Date(fechaDesde);
    const hasta = new Date(fechaHasta);
    hasta.setHours(23, 59, 59); // Incluir todo el día final

    // 1. Filtrar Listas Crudas
    const pedidosEnRango = pedidos.filter(p => {
      if (p.cancelado) return false;
      if (!p.pagado) return false;
      const f = new Date(p.fechaEntrega);
      // Ajuste de zona horaria simple para comparar fechas
      return f >= desde && f <= hasta;
    });

    const gastosEnRango = gastos.filter(g => {
      const f = new Date(g.fecha);
      // Ajustamos la fecha del gasto para evitar problemas de zona horaria al comparar
      const fGasto = new Date(f.valueOf() + f.getTimezoneOffset() * 60000);
      return fGasto >= desde && fGasto <= hasta;
    });

    // 2. Agrupar por Periodo (Día, Mes, Año)
    const mapa = new Map<string, FilaReporte>();

    const getClaveFecha = (dateStr: string) => {
      const d = new Date(dateStr);
      // Ajuste manual para que la fecha visual coincida (evitar offset GMT)
      const dLocal = new Date(d.valueOf() + d.getTimezoneOffset() * 60000);

      if (agrupacion === 'dia') return dLocal.toLocaleDateString('es-AR'); // DD/MM/AAAA
      if (agrupacion === 'mes') return `${dLocal.getMonth() + 1}/${dLocal.getFullYear()}`; // MM/AAAA
      return `${dLocal.getFullYear()}`; // AAAA
    };

    // Sumar Ingresos
    pedidosEnRango.forEach(p => {
      const clave = getClaveFecha(p.fechaEntrega);
      const actual = mapa.get(clave) || { fecha: clave, ingresos: 0, egresos: 0, balance: 0 };
      actual.ingresos += (p.total || 0);
      actual.balance = actual.ingresos - actual.egresos;
      mapa.set(clave, actual);
    });

    // Sumar Egresos
    gastosEnRango.forEach(g => {
      const clave = getClaveFecha(g.fecha);
      const actual = mapa.get(clave) || { fecha: clave, ingresos: 0, egresos: 0, balance: 0 };
      actual.egresos += (g.monto || 0);
      actual.balance = actual.ingresos - actual.egresos;
      mapa.set(clave, actual);
    });

    // Convertir a Array y Ordenar (Truco: Ordenar por fecha es complejo con strings formateados, usamos el orden de inserción o un sort básico)
    // Para simplificar, convertimos a array.
    const reporte = Array.from(mapa.values());

    const totalIngresos = pedidosEnRango.reduce((acc, p) => acc + (p.total || 0), 0);
    const totalEgresos = gastosEnRango.reduce((acc, g) => acc + (g.monto || 0), 0);

    return { reporte, totalIngresos, totalEgresos, pedidosFiltrados: pedidosEnRango, gastosFiltrados: gastosEnRango };
  }, [pedidos, gastos, fechaDesde, fechaHasta, agrupacion]);


  // --- EXPORTAR A EXCEL ---
  const descargarExcel = () => {
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen Agrupado
    const wsResumen = XLSX.utils.json_to_sheet(datosFiltrados.reporte);
    XLSX.utils.book_append_sheet(wb, wsResumen, "Resumen Financiero");

    // Hoja 2: Detalle Ingresos (Pedidos)
    const detalleIngresos = datosFiltrados.pedidosFiltrados.map(p => ({
      ID: p.idPedido,
      Fecha: new Date(p.fechaEntrega).toLocaleDateString('es-AR'),
      Cliente: `${p.cliente.nombre} ${p.cliente.apellido}`,
      Total: p.total,
      Detalle: p.detalles.map(d => `${d.cantidad}x ${d.producto.nombre}`).join(', ')
    }));
    const wsIngresos = XLSX.utils.json_to_sheet(detalleIngresos);
    XLSX.utils.book_append_sheet(wb, wsIngresos, "Detalle Ingresos");

    // Hoja 3: Detalle Egresos (Gastos)
    const detalleEgresos = datosFiltrados.gastosFiltrados.map(g => ({
      ID: g.idGasto,
      Fecha: new Date(g.fecha).toLocaleDateString('es-AR'),
      Descripción: g.descripcion,
      Monto: g.monto
    }));
    const wsEgresos = XLSX.utils.json_to_sheet(detalleEgresos);
    XLSX.utils.book_append_sheet(wb, wsEgresos, "Detalle Egresos");

    // Guardar archivo
    XLSX.writeFile(wb, `Reporte_BatiendoConAmor_${fechaDesde}_al_${fechaHasta}.xlsx`);
  };

  // --- MANEJADORES DE GASTO (CRUD) ---
  const handleGuardarGasto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoGasto.descripcion || nuevoGasto.monto <= 0) return showError("Datos inválidos");
    try {
      await gastoService.crear(nuevoGasto);
      setNuevoGasto({ ...nuevoGasto, descripcion: '', monto: 0 });
      showSuccess("Gasto registrado");
      cargarDatos();
    } catch (error) {
      showError("Error guardando gasto");
    }
  };

  const handleBorrarGasto = (id: number) => {
    showConfirm("¿Eliminar este gasto?", async () => {
      try {
        await gastoService.eliminar(id);
        cargarDatos();
      } catch (e) { showError("No se pudo eliminar"); }
    });
  };

  return (
    <main className="pb-20 relative">
      <AlertModal
        isOpen={alertConfig.isOpen}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
      />

      <h1 className="text-3xl font-bold mb-6 text-pink-600 border-b pb-2">
        💰 Finanzas y Reportes
      </h1>

      {/* --- SECCIÓN DE FILTROS Y REPORTE --- */}
      <div className="bg-white p-6 rounded-xl shadow mb-8 border border-pink-100">
        <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
          📊 Generador de Informes
        </h2>

        <div className="flex flex-wrap gap-4 items-end mb-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Desde</label>
            <input
              type="date"
              className="border p-2 rounded text-sm"
              value={fechaDesde}
              onChange={e => setFechaDesde(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hasta</label>
            <input
              type="date"
              className="border p-2 rounded text-sm"
              value={fechaHasta}
              onChange={e => setFechaHasta(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Agrupar por</label>
            <select
              className="border p-2 rounded text-sm bg-white"
              value={agrupacion}
              onChange={e => setAgrupacion(e.target.value as Agrupacion)}
            >
              <option value="dia">Día</option>
              <option value="mes">Mes</option>
              <option value="anio">Año</option>
            </select>
          </div>

          <div className="flex-1 text-right">
            <button
              onClick={descargarExcel}
              disabled={datosFiltrados.reporte.length === 0}
              className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700 transition disabled:bg-gray-300 font-bold flex items-center gap-2 ml-auto"
            >
              📥 Descargar Excel
            </button>
          </div>
        </div>

        {/* TARJETAS DE RESUMEN DEL FILTRO */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-50 p-4 rounded border border-green-200">
            <p className="text-xs text-green-700 font-bold uppercase">Ingresos (Periodo)</p>
            <p className="text-2xl font-bold text-green-700">$ {datosFiltrados.totalIngresos.toLocaleString()}</p>
          </div>
          <div className="bg-red-50 p-4 rounded border border-red-200">
            <p className="text-xs text-red-700 font-bold uppercase">Egresos (Periodo)</p>
            <p className="text-2xl font-bold text-red-700">$ {datosFiltrados.totalEgresos.toLocaleString()}</p>
          </div>
          <div className={`p-4 rounded border ${datosFiltrados.totalIngresos - datosFiltrados.totalEgresos >= 0 ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-yellow-50 border-yellow-200 text-yellow-700'}`}>
            <p className="text-xs font-bold uppercase">Balance Neto</p>
            <p className="text-2xl font-bold">$ {(datosFiltrados.totalIngresos - datosFiltrados.totalEgresos).toLocaleString()}</p>
          </div>
        </div>

        {/* TABLA DE PREVISUALIZACIÓN */}
        {datosFiltrados.reporte.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm divide-y divide-gray-200 border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-bold text-gray-600">Fecha / Periodo</th>
                  <th className="px-4 py-2 text-right font-bold text-green-600">Ingresos</th>
                  <th className="px-4 py-2 text-right font-bold text-red-600">Egresos</th>
                  <th className="px-4 py-2 text-right font-bold text-gray-700">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {datosFiltrados.reporte.map((fila, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">{fila.fecha}</td>
                    <td className="px-4 py-2 text-right text-green-600">$ {fila.ingresos.toLocaleString()}</td>
                    <td className="px-4 py-2 text-right text-red-600">$ {fila.egresos.toLocaleString()}</td>
                    <td className={`px-4 py-2 text-right font-bold ${fila.balance >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
                      $ {fila.balance.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-400 italic py-4">No hay movimientos en este rango de fechas.</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* --- FORMULARIO DE GASTO --- */}
        <div className="bg-white p-6 rounded-lg shadow h-fit border border-pink-100">
          <h2 className="text-lg font-bold mb-4 text-gray-700">Registrar Nuevo Gasto</h2>
          <form onSubmit={handleGuardarGasto} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <input
                type="text" placeholder="Ej: 10kg Harina"
                className="w-full border p-2 rounded mt-1"
                value={nuevoGasto.descripcion}
                onChange={e => setNuevoGasto({ ...nuevoGasto, descripcion: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Monto ($)</label>
                <input
                  type="number" placeholder="0"
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
            <button type="submit" className="w-full bg-red-500 text-white font-bold py-2 rounded hover:bg-red-600 transition">
              - Registrar Egreso
            </button>
          </form>
        </div>

        {/* --- LISTA HISTÓRICA SIMPLE (Últimos movimientos) --- */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold mb-4 text-gray-700">Últimos Gastos Registrados</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden h-96 overflow-y-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Monto</th>
                  <th className="px-6 py-3 text-right"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {/* Mostramos todos los gastos cargados, ordenados por fecha inversa */}
                {[...gastos].reverse().map((g) => (
                  <tr key={g.idGasto} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(g.fecha).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800">{g.descripcion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-red-600 font-bold">
                      - $ {(g.monto || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleBorrarGasto(g.idGasto)} className="text-gray-300 hover:text-red-500">🗑️</button>
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