'use client';

import { useEffect, useState } from 'react';
import { productoService, ProductoRequest } from '@/services/productoService';
import { Producto } from '@/types';
import { opcionService } from '@/services/opcionService';
import { Atributo } from '@/types';

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [idEdicion, setIdEdicion] = useState<number | null>(null);
  const [todosAtributos, setTodosAtributos] = useState<Atributo[]>([]);

  // ESTADO DEL FORMULARIO
  const [nuevoProd, setNuevoProd] = useState<ProductoRequest>({
    nombre: '', unidad: 'unidad', precioBase: 0,
    idsAtributosValidos: [] // <--- NUEVO
  });

  // ESTADO EXTRA: Para el tamaño personalizado (cm)
  const [tamanioCm, setTamanioCm] = useState<string>('');

  const cargarDatos = async () => {
    try {
      // Usamos Promise.all para traer todo junto y rápido
      const [prods, attrs] = await Promise.all([
        productoService.listar(false),
        opcionService.listarAtributos() // Trae las categorías
      ]);
      setProductos(prods);
      setTodosAtributos(attrs);
    } catch (error) {
      alert('Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos(); // Llamamos a la nueva función
  }, []);

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validaciones Básicas
    if (!nuevoProd.nombre.trim()) return alert("⚠️ El nombre es obligatorio");
    if (nuevoProd.precioBase <= 0) return alert("⚠️ El precio debe ser mayor a 0");

    // 2. Lógica Especial para "cm"
    let unidadFinal = nuevoProd.unidad;

    if (nuevoProd.unidad === 'cm') {
      // Validamos que el tamaño sea positivo
      if (!tamanioCm || parseFloat(tamanioCm) <= 0) {
        return alert("⚠️ Por favor ingresa un tamaño en cm válido (mayor a 0).");
      }
      // Combinamos el número con la unidad para guardarlo en BD (Ej: "23 cm")
      unidadFinal = `${tamanioCm} cm`;
    }

    // Preparamos el objeto para enviar
    const productoAEnviar = { ...nuevoProd, unidad: unidadFinal };

    try {
      if (idEdicion) {
        await productoService.actualizar(idEdicion, productoAEnviar);
        alert("✅ Producto actualizado");
      } else {
        await productoService.crear(productoAEnviar);
        alert("✅ Producto creado");
      }
      limpiarFormulario();
      cargarDatos();
    } catch (error) {
      alert("❌ Error al guardar producto");
    }
  };

  const cargarParaEditar = (prod: Producto) => {
    setIdEdicion(prod.idProducto);

    // Lógica Inversa: Detectar si la unidad guardada es tipo "23 cm"
    let unitSelect = prod.unidad || 'unidad';
    let sizeInput = '';

    // Si termina en " cm" (espacio + cm), intentamos extraer el número
    if (prod.unidad && prod.unidad.endsWith(' cm')) {
      const partes = prod.unidad.split(' '); // ["23", "cm"]
      if (partes.length === 2 && !isNaN(Number(partes[0]))) {
        sizeInput = partes[0]; // "23"
        unitSelect = 'cm';     // Seleccionamos "cm" en el dropdown
      }
    }

    setNuevoProd({
      nombre: prod.nombre || '',
      unidad: unitSelect,
      precioBase: prod.precioBase || 0,
      idsAtributosValidos: prod.atributosValidos?.map(a => a.idAtributo) || []
    });
    setTamanioCm(sizeInput);

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const limpiarFormulario = () => {
    setIdEdicion(null);
    setNuevoProd({ nombre: '', unidad: 'unidad', precioBase: 0, idsAtributosValidos: [] });
    setTamanioCm(''); // Limpiamos también el extra
  };

  const handleBorrar = async (id: number) => {
    if (confirm('¿Desactivar este producto?')) {
      await productoService.eliminar(id);
      cargarDatos();
    }
  };

  const toggleAtributo = (idAttr: number) => {
    const actuales = nuevoProd.idsAtributosValidos || [];
    if (actuales.includes(idAttr)) {
      // Si ya estaba, lo sacamos (filtro)
      setNuevoProd({
        ...nuevoProd,
        idsAtributosValidos: actuales.filter(id => id !== idAttr)
      });
    } else {
      // Si no estaba, lo agregamos
      setNuevoProd({
        ...nuevoProd,
        idsAtributosValidos: [...actuales, idAttr]
      });
    }
  };

  return (
    <main className="pb-10">
      <h1 className="text-3xl font-bold mb-6 text-pink-600 border-b pb-2">
        Inventario de Productos
      </h1>

      {/* --- FORMULARIO --- */}
      <div className={`p-6 rounded-lg shadow-md mb-8 border transition-colors ${idEdicion ? 'bg-blue-50 border-blue-200' : 'bg-white border-pink-100'}`}>

        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-bold ${idEdicion ? 'text-blue-700' : 'text-gray-700'}`}>
            {idEdicion ? `✏️ Editando: ${nuevoProd.nombre}` : '🍰 Nuevo Producto'}
          </h2>
          {idEdicion && (
            <button onClick={limpiarFormulario} className="text-sm text-gray-500 hover:text-gray-700 underline">
              Cancelar Edición
            </button>
          )}
        </div>

        <form onSubmit={handleGuardar} className="flex flex-wrap gap-4 items-end">
          {/* Nombre */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text" required
              className="border p-2 rounded w-full"
              placeholder="Ej: Torta Bombón"
              value={nuevoProd.nombre}
              onChange={e => setNuevoProd({ ...nuevoProd, nombre: e.target.value })}
            />
          </div>

          {/* Unidad (Selector) */}
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700">Unidad</label>
            <select
              className="border p-2 rounded w-full bg-white h-[42px]"
              value={nuevoProd.unidad}
              onChange={e => {
                setNuevoProd({ ...nuevoProd, unidad: e.target.value });
                if (e.target.value !== 'cm') setTamanioCm(''); // Limpiar si cambia
              }}
            >
              <option value="unidad">Unidad</option>
              <option value="kg">Kg</option>
              <option value="docena">Docena</option>
              <option value="porcion">Porción</option>
              <option value="cm">cm (Diámetro)</option> {/* Opción especial */}
            </select>
          </div>

          {/* Input Condicional: Solo aparece si eliges "cm" */}
          {nuevoProd.unidad === 'cm' && (
            <div className="w-24 animate-fade-in">
              <label className="block text-sm font-medium text-pink-600">Tamaño</label>
              <div className="relative">
                <input
                  type="number" required min="1"
                  className="border border-pink-300 p-2 rounded w-full outline-pink-500"
                  placeholder="23"
                  value={tamanioCm}
                  onChange={e => setTamanioCm(e.target.value)}
                />
                <span className="absolute right-2 top-2 text-gray-400 text-xs">cm</span>
              </div>
            </div>
          )}

          {/* Precio */}
          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700">Precio Base</label>
            <div className="relative">
              <span className="absolute left-2 top-2 text-gray-500">$</span>
              <input
                type="number" required min="1" step="0.01"
                className="border p-2 pl-6 rounded w-full"
                placeholder="0.00"
                value={nuevoProd.precioBase}
                onChange={e => setNuevoProd({ ...nuevoProd, precioBase: parseFloat(e.target.value) })}
              />
            </div>
          </div>

          <div className="w-full mt-2 border-t pt-3 animate-fade-in">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              ¿Qué ingredientes/extras permite?
            </label>
            <div className="flex flex-wrap gap-3">
              {todosAtributos.length > 0 ? todosAtributos.map(attr => (
                <label
                  key={attr.idAtributo}
                  className={`flex items-center gap-2 cursor-pointer px-3 py-1 rounded border transition-colors select-none ${nuevoProd.idsAtributosValidos?.includes(attr.idAtributo)
                    ? 'bg-pink-100 border-pink-300 text-pink-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-pink-200'
                    }`}
                >
                  <input
                    type="checkbox"
                    className="accent-pink-500 w-4 h-4"
                    checked={nuevoProd.idsAtributosValidos?.includes(attr.idAtributo)}
                    onChange={() => toggleAtributo(attr.idAtributo)}
                  />
                  <span className="text-sm font-medium">{attr.nombre}</span>
                </label>
              )) : (
                <span className="text-xs text-gray-400 italic">No hay categorías de ingredientes creadas.</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              * Si no marcas ninguno, el producto no tendrá opciones de personalización.
            </p>
          </div>

          <button
            type="submit"
            className={`font-bold py-2 px-6 rounded transition h-[42px] ${idEdicion ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-pink-500 hover:bg-pink-600 text-white'}`}
          >
            {idEdicion ? 'Actualizar' : 'Guardar'}
          </button>
        </form>
      </div>

      {/* --- TABLA --- */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-pink-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Precio Base</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unidad / Tam.</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
              <th className="px-6 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productos.map((p) => (
              <tr key={p.idProducto} className={!p.activo ? "bg-gray-50 opacity-60" : "hover:bg-gray-50 group"}>
                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{p.nombre}</td>
                <td className="px-6 py-4 whitespace-nowrap text-green-600 font-bold">$ {p.precioBase.toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                  {/* Si es una medida especial (contiene números), la destacamos un poco */}
                  {/\d/.test(p.unidad) ? (
                    <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-700 border border-gray-300">
                      {p.unidad}
                    </span>
                  ) : p.unidad}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {p.activo ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Activo</span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Inactivo</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => cargarParaEditar(p)} className="text-blue-500 hover:text-blue-700 font-bold">✏️ Editar</button>
                    {p.activo ? (
                      <button onClick={() => handleBorrar(p.idProducto)} className="text-red-500 hover:text-red-700 font-bold">✕ Baja</button>
                    ) : (
                      <button onClick={async () => { await productoService.activar(p.idProducto); cargarDatos(); }} className="text-green-600 hover:text-green-800 font-bold">⟳ Alta</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}