'use client';

import { useEffect, useState } from 'react';
import Link from "next/link";
import { pedidoService } from '@/services/pedidoService';
import { Pedido } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pendientes: 0,
    pagosPendientes: 0,
    ingresosMes: 0,
    mejorCliente: '-'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calcularEstadisticas = async () => {
      try {
        const pedidos = await pedidoService.listar();

        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const anioActual = hoy.getFullYear();

        // Normalizamos "hoy" para que la hora sea 00:00:00
        hoy.setHours(0, 0, 0, 0);

        // --- 1. PEDIDOS PENDIENTES (No cancelados y fecha >= hoy) ---
        const pendientes = pedidos.filter(p => {
          if (p.cancelado) return false; // Ignorar cancelados
          if (p.pagado) return false; // Ignorar pagados
          if (p.entregado) return false; // Ignorar entregados

          const fechaEntrega = new Date(p.fechaEntrega);
          // Ajustamos la zona horaria sumando el offset si es necesario, 
          // pero para comparaciones simples de día esto suele bastar:
          fechaEntrega.setHours(0, 0, 0, 0);

          return fechaEntrega.getTime() >= hoy.getTime();
        }).length;

        // --- 4. PAGOS PENDIENTES (No cancelados y !pagado) ---
        const pagosPendientes = pedidos.filter(p => !p.cancelado && !p.pagado).length;

        // --- 2. INGRESOS DEL MES (No cancelados) ---
        const ingresos = pedidos.reduce((acc, p) => {
          if (p.cancelado) return acc; // Ignorar cancelados
          if (!p.pagado) return acc; // Ignorar no pagados

          const fecha = new Date(p.fechaEntrega);
          if (fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
            return acc + (p.total || 0);
          }
          return acc;
        }, 0);

        // --- 3. MEJOR CLIENTE (No cancelados) ---
        const gastosPorCliente: Record<string, number> = {};

        pedidos.forEach(p => {
          if (p.cancelado) return; // Ignorar cancelados
          if (!p.pagado) return; // Ignorar no pagados

          const nombreCompleto = `${p.cliente.nombre} ${p.cliente.apellido}`;
          if (!gastosPorCliente[nombreCompleto]) {
            gastosPorCliente[nombreCompleto] = 0;
          }
          gastosPorCliente[nombreCompleto] += (p.total || 0);
        });

        // Encontrar el máximo
        let mejorClienteNombre = '-';
        let maxGasto = 0;

        Object.entries(gastosPorCliente).forEach(([nombre, total]) => {
          if (total > maxGasto) {
            maxGasto = total;
            mejorClienteNombre = nombre;
          }
        });

        setStats({
          pendientes,
          pagosPendientes,
          ingresosMes: ingresos,
          mejorCliente: mejorClienteNombre
        });

      } catch (error) {
        console.error("Error calculando estadísticas:", error);
      } finally {
        setLoading(false);
      }
    };

    calcularEstadisticas();
  }, []);

  return (
    <main>
      {/* Encabezado de Bienvenida */}
      <div className="mb-8 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-800">
          ¡Hola, Mamá! 👋
        </h1>
        <p className="text-gray-500 mt-2">
          Bienvenida al sistema de gestión de <strong>Batiendo con Amor</strong>.
          ¿Qué te gustaría hacer hoy?
        </p>
      </div>

      {/* Grid de Accesos Directos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Tarjeta 1: Nuevo Pedido */}
        <Link
          href="/pedidos/nuevo"
          className="bg-pink-500 hover:bg-pink-600 transition text-white p-6 rounded-xl shadow-lg flex flex-col items-center justify-center text-center group cursor-pointer"
        >
          <div className="text-4xl mb-3 group-hover:scale-110 transition">📝</div>
          <h3 className="text-xl font-bold">Nuevo Pedido</h3>
          <p className="text-pink-100 text-sm mt-1">Registrar una nueva venta</p>
        </Link>

        {/* Tarjeta 2: Clientes */}
        <Link
          href="/clientes"
          className="bg-white hover:border-pink-300 border border-transparent transition p-6 rounded-xl shadow flex flex-col items-center justify-center text-center cursor-pointer"
        >
          <div className="text-4xl mb-3">👥</div>
          <h3 className="text-xl font-bold text-gray-700">Ver Clientes</h3>
          <p className="text-gray-400 text-sm mt-1">Administrar agenda</p>
        </Link>

        {/* Tarjeta 3: Productos */}
        <Link
          href="/productos"
          className="bg-white hover:border-pink-300 border border-transparent transition p-6 rounded-xl shadow flex flex-col items-center justify-center text-center cursor-pointer"
        >
          <div className="text-4xl mb-3">🧁</div>
          <h3 className="text-xl font-bold text-gray-700">Inventario</h3>
          <p className="text-gray-400 text-sm mt-1">Precios y productos</p>
        </Link>

        {/* Tarjeta 4: Resumen (CONECTADO AL BACKEND) */}
        <div className="bg-linear-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow border border-purple-100 md:col-span-2 lg:col-span-3">
          <h3 className="text-lg font-bold text-gray-700 mb-4">📊 Estado del Negocio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Pedidos Pendientes */}
            <div className="bg-white p-4 rounded shadow-sm text-center">
              <p className="text-gray-500 text-xs uppercase font-bold">Pedidos Pendientes</p>
              <p className="text-3xl font-bold text-orange-500">
                {loading ? '...' : stats.pendientes}
              </p>
            </div>

            {/* Pagos Pendientes */}
            <div className="bg-white p-4 rounded shadow-sm text-center">
              <p className="text-gray-500 text-xs uppercase font-bold">Pagos Pendientes</p>
              <p className="text-3xl font-bold text-blue-500">
                {loading ? '...' : stats.pagosPendientes}
              </p>
            </div>

            {/* Ingresos del Mes */}
            <div className="bg-white p-4 rounded shadow-sm text-center">
              <p className="text-gray-500 text-xs uppercase font-bold">Ingresos del Mes</p>
              <p className="text-3xl font-bold text-green-500">
                {loading ? '...' : `$ ${stats.ingresosMes.toLocaleString()}`}
              </p>
            </div>

            {/* Mejor Cliente */}
            <div className="bg-white p-4 rounded shadow-sm text-center">
              <p className="text-gray-500 text-xs uppercase font-bold">Mejor Cliente</p>
              <p className="text-xl font-bold text-gray-700 truncate">
                {loading ? '...' : stats.mejorCliente}
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  );
}