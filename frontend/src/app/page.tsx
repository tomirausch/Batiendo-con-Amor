import Link from "next/link";

export default function Dashboard() {
  return (
    <main>
      {/* Encabezado de Bienvenida */}
      <div className="mb-8">
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
        
        {/* Tarjeta 1: Nuevo Pedido (La acción más frecuente) */}
        <Link 
          href="/pedidos/nuevo" // Esta ruta la crearemos pronto
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

        {/* Tarjeta 4: Resumen (Stats Visuales - Placeholder) */}
        <div className="bg-linear-to-br from-purple-50 to-pink-50 p-6 rounded-xl shadow border border-purple-100 md:col-span-2 lg:col-span-3">
          <h3 className="text-lg font-bold text-gray-700 mb-4">📊 Estado del Negocio</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded shadow-sm text-center">
              <p className="text-gray-500 text-xs uppercase font-bold">Pedidos Pendientes</p>
              <p className="text-3xl font-bold text-orange-500">0</p> 
              {/* Aquí conectaremos con el backend más adelante */}
            </div>
            <div className="bg-white p-4 rounded shadow-sm text-center">
              <p className="text-gray-500 text-xs uppercase font-bold">Ingresos del Mes</p>
              <p className="text-3xl font-bold text-green-500">$0</p>
            </div>
            <div className="bg-white p-4 rounded shadow-sm text-center">
              <p className="text-gray-500 text-xs uppercase font-bold">Mejor Cliente</p>
              <p className="text-xl font-bold text-gray-700">-</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}