'use client';

import { useEffect, useState } from 'react';
import { opcionService } from '@/services/opcionService';
import { OpcionAtributo, Atributo, OpcionRequest } from '@/types';

export default function ConfiguracionPage() {
  const [atributos, setAtributos] = useState<Atributo[]>([]);
  const [opciones, setOpciones] = useState<OpcionAtributo[]>([]);
  const [loading, setLoading] = useState(true);
  const [creandoCategoria, setCreandoCategoria] = useState(false);
  const [nombreNuevaCat, setNombreNuevaCat] = useState('');

  // Formulario
  const [nuevaOp, setNuevaOp] = useState<OpcionRequest>({
    nombre: '', precioExtra: 0, idAtributo: 0
  });

  const cargarDatos = async () => {
    try {
      const [attrData, opData] = await Promise.all([
        opcionService.listarAtributos(),
        opcionService.listar()
      ]);
      setAtributos(attrData);
      setOpciones(opData);
      
      // Si hay atributos, pre-seleccionamos el primero en el select
      if(attrData.length > 0 && nuevaOp.idAtributo === 0) {
        setNuevaOp(prev => ({...prev, idAtributo: attrData[0].idAtributo}));
      }
    } catch (error) {
      alert("Error cargando configuración");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaOp.nombre || !nuevaOp.idAtributo) return alert("Datos incompletos");

    try {
      await opcionService.crear(nuevaOp);
      setNuevaOp({ ...nuevaOp, nombre: '', precioExtra: 0 }); // Limpiamos campos (mantenemos categoría)
      cargarDatos();
    } catch (error) {
      alert("Error guardando opción");
    }
  };

  const handleBorrar = async (id: number) => {
    if(confirm("¿Eliminar esta opción? (Cuidado si ya se usó en pedidos)")) {
        try {
            await opcionService.eliminar(id);
            cargarDatos();
        } catch (e) {
            alert("No se puede eliminar porque ya está en uso en un pedido histórico.");
        }
    }
  }

  const handleGuardarCategoria = async () => {
    if (!nombreNuevaCat.trim()) return alert("Escribe un nombre para la categoría");

    try {
      const nuevaCat = await opcionService.crearAtributo(nombreNuevaCat);
      
      // 1. Recargamos la lista de atributos
      const listaActualizada = await opcionService.listarAtributos();
      setAtributos(listaActualizada);
      
      // 2. Seleccionamos la nueva categoría automáticamente en el formulario principal
      setNuevaOp({ ...nuevaOp, idAtributo: nuevaCat.idAtributo });
      
      // 3. Volvemos al modo normal
      setCreandoCategoria(false);
      setNombreNuevaCat('');
      alert(`Categoría "${nuevaCat.nombre}" creada.`);
    } catch (error) {
      alert("Error creando categoría");
    }
  };

  return (
    <main>
      <h1 className="text-3xl font-bold mb-6 text-pink-600 border-b pb-2">
        ⚙️ Configuración de Ingredientes
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- COLUMNA IZQUIERDA: FORMULARIO --- */}
        <div className="bg-white p-6 rounded-lg shadow h-fit border border-pink-100">
          <h2 className="text-lg font-bold mb-4 text-gray-700">Agregar Nuevo Extra</h2>
          <form onSubmit={handleGuardar} className="space-y-4">
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Categoría {creandoCategoria && "(Nueva)"}
              </label>
              
              {!creandoCategoria ? (
                // MODO SELECCIÓN (Dropdown normal)
                <div className="flex gap-2">
                  <select 
                    className="w-full border p-2 rounded mt-1 bg-white"
                    value={nuevaOp.idAtributo}
                    onChange={e => setNuevaOp({...nuevaOp, idAtributo: parseInt(e.target.value)})}
                  >
                    {atributos.map(a => (
                      <option key={a.idAtributo} value={a.idAtributo}>{a.nombre}</option>
                    ))}
                  </select>
                  <button 
                    type="button"
                    onClick={() => setCreandoCategoria(true)}
                    className="mt-1 bg-gray-100 border border-gray-300 px-3 rounded hover:bg-gray-200 font-bold text-gray-600 text-xl"
                    title="Crear nueva categoría"
                  >
                    +
                  </button>
                </div>
              ) : (
                // MODO CREACIÓN (Input de texto)
                <div className="flex gap-2 animate-fade-in">
                  <input 
                    type="text" 
                    placeholder="Ej: Toppings / Cajas"
                    className="w-full border p-2 rounded mt-1 outline-blue-500 border-blue-300"
                    value={nombreNuevaCat}
                    onChange={e => setNombreNuevaCat(e.target.value)}
                    autoFocus
                  />
                  <button 
                    type="button"
                    onClick={handleGuardarCategoria}
                    className="mt-1 bg-blue-600 text-white px-3 rounded hover:bg-blue-700 font-bold"
                  >
                    OK
                  </button>
                  <button 
                    type="button"
                    onClick={() => setCreandoCategoria(false)}
                    className="mt-1 text-red-500 px-2 rounded hover:bg-red-50 font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre del Ingrediente</label>
              <input 
                type="text" 
                placeholder="Ej: Crema Moka"
                className="w-full border p-2 rounded mt-1"
                value={nuevaOp.nombre}
                onChange={e => setNuevaOp({...nuevaOp, nombre: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Precio Extra ($)</label>
              <input 
                type="number" 
                placeholder="0"
                className="w-full border p-2 rounded mt-1"
                value={nuevaOp.precioExtra}
                onChange={e => setNuevaOp({...nuevaOp, precioExtra: parseFloat(e.target.value)})}
              />
            </div>

            <button 
              type="submit" 
              className="w-full bg-pink-500 text-white font-bold py-2 rounded hover:bg-pink-600 transition"
            >
              + Agregar Opción
            </button>
          </form>
        </div>

        {/* --- COLUMNA DERECHA: LISTA AGRUPADA --- */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? <p>Cargando...</p> : atributos.map(attr => {
            // Filtramos las opciones que pertenecen a esta categoría
            const opcionesDeEsteAtributo = opciones.filter(o => o.atributo?.idAtributo === attr.idAtributo || o.idAtributo === attr.idAtributo); 
            // Nota: La condicion o.opcionAtributo... depende de como venga tu JSON del backend.
            // Si el backend manda { idOpcion: 1, atributo: {id:1...} } usa esa estructura.
            // Voy a asumir que tu OpcionAtributo en frontend tiene la estructura anidada correcta.
            // CORRECCION: En tu JSON del backend se veia "atributo": {...} dentro de opcionAtributo.
            // Pero en el servicio listar() devuelve OpcionAtributo directo.
            // Vamos a filtrar asumiendo que el objeto OpcionAtributo tiene un campo 'atributo'.

            const misOpciones = opciones.filter(o => o.atributo?.idAtributo === attr.idAtributo);

            return (
              <div key={attr.idAtributo} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="bg-pink-50 px-4 py-2 border-b border-pink-100 font-bold text-pink-700 flex justify-between">
                  <span>📂 {attr.nombre}</span>
                  <span className="text-xs bg-pink-200 px-2 py-1 rounded text-pink-800">{misOpciones.length} items</span>
                </div>
                
                <div className="divide-y divide-gray-100">
                    {misOpciones.length === 0 ? (
                        <p className="p-4 text-sm text-gray-400">No hay opciones creadas.</p>
                    ) : misOpciones.map(op => (
                        <div key={op.idOpcion} className="p-3 flex justify-between items-center hover:bg-gray-50">
                            <div>
                                <span className="font-medium text-gray-800">{op.nombre}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-green-600 font-bold bg-green-50 px-2 py-1 rounded text-sm">
                                    +${op.precioExtra}
                                </span>
                                <button 
                                    onClick={() => handleBorrar(op.idOpcion)}
                                    className="text-gray-400 hover:text-red-500"
                                >
                                    🗑️
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}