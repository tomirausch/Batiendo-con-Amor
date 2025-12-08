import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-pink-100 h-screen fixed left-0 top-0 border-r border-pink-200 shadow-md">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-pink-600">
           🍰 Gestión
        </h1>
        <p className="text-xs text-pink-400 mt-1">Batiendo con Amor</p>
      </div>

      <nav className="mt-6">
        <ul className="space-y-2">
          {/* NUEVO: Botón de Inicio */}
          <li>
            <Link 
              href="/" 
              className="block px-6 py-3 text-gray-700 hover:bg-pink-200 hover:text-pink-700 transition font-medium"
            >
              🏠 Inicio
            </Link>
          </li>
          
          {/* ACTUALIZADO: Apunta a /clientes */}
          <li>
            <Link 
              href="/clientes" 
              className="block px-6 py-3 text-gray-700 hover:bg-pink-200 hover:text-pink-700 transition font-medium"
            >
              👥 Clientes
            </Link>
          </li>
          <li>
            <Link 
              href="/productos" 
              className="block px-6 py-3 text-gray-700 hover:bg-pink-200 hover:text-pink-700 transition font-medium"
            >
              🧁 Productos
            </Link>
          </li>
          <li>
            <Link 
              href="/pedidos" 
              className="block px-6 py-3 text-gray-700 hover:bg-pink-200 hover:text-pink-700 transition font-medium"
            >
              📝 Pedidos
            </Link>
          </li>
          <li>
            <Link 
                href="/configuracion" 
                className="block px-6 py-3 text-gray-700 hover:bg-pink-200 hover:text-pink-700 transition font-medium"
            >
                ⚙️ Ingredientes
            </Link>
          </li>
          <li>
            <Link 
              href="/finanzas" 
              className="block px-6 py-3 text-gray-700 hover:bg-pink-200 hover:text-pink-700 transition font-medium"
            >
              💰 Finanzas
            </Link>
          </li>
        </ul>
      </nav>
      {/* ... Footer ... */}
    </aside>
  );
}