'use client'; // 1. Convertimos a Client Component para usar hooks

import { useEffect, useState } from 'react';
import Link from "next/link";
import { pedidoService } from '@/services/pedidoService';
import { Pedido } from '@/types';

export default function Dashboard() {
  const [stats, setStats] = useState({
    pendientes: 0,
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

        // --- 1. PEDIDOS PENDIENTES (Desde hoy en adelante) ---
        // Normalizamos "hoy" para que la hora sea 00:00:00 y no afecte la comparación
        hoy.setHours(0, 0, 0, 0);

        const pendientes = pedidos.filter(p => {
          // Asumimos que fechaEntrega viene como "YYYY-MM-DD" o ISO
          // Le agregamos "T00:00:00" para asegurar que se interprete como local o UTC según convenga,
          // pero para simplificar, usaremos new Date(p.fechaEntrega) directo.
          const fechaEntrega = new Date(p.fechaEntrega);
          // Ajustamos zona horaria si es necesario, pero por ahora comparamos directo
          return fechaEntrega >= hoy;
        }).length;

        // --- 2. INGRESOS DEL MES ---
        const ingresos = pedidos.reduce((acc, p) => {
          const fecha = new Date(p.fechaEntrega);
          if (fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
            return acc + (p.total || 0);
          }
          return acc;
        }, 0);

        // --- 3. MEJOR CLIENTE (El que más gastó históricamente) ---
        const gastosPorCliente: Record<string, number> = {};

        pedidos.forEach(p => {
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Pedidos Pendientes */}
            <div className="bg-white p-4 rounded shadow-sm text-center">
              <p className="text-gray-500 text-xs uppercase font-bold">Pedidos Pendientes</p>
              <p className="text-3xl font-bold text-orange-500">
                {loading ? '...' : stats.pendientes}
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