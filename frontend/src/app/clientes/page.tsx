'use client';

import { useEffect, useState } from 'react';
import { clienteService } from '@/services/clienteService';
import { Cliente, ClienteRequest } from '@/types';

export default function ClientesPage() {
  const [activos, setActivos] = useState<Cliente[]>([]);
  const [inactivos, setInactivos] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  // ESTADO NUEVO: Para saber si estamos editando a alguien
  const [idEdicion, setIdEdicion] = useState<number | null>(null);

  const [formulario, setFormulario] = useState<ClienteRequest>({
    nombre: '', apellido: '', direccion: '', telefono: ''
  });

  const cargarClientes = async () => {
    setLoading(true);
    try {
      const data = await clienteService.listar(false); // Traemos todos
      setActivos(data.filter(c => c.activo));
      setInactivos(data.filter(c => !c.activo));
    } catch (error) {
      console.error(error);
      alert('Error cargando clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarClientes();
  }, []);

  // Función unificada para Guardar (Crear o Editar)
  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formulario.nombre || !formulario.apellido) return alert("Datos incompletos");

    try {
      if (idEdicion) {
        // --- MODO EDICIÓN (PUT) ---
        await clienteService.actualizar(idEdicion, formulario);
        alert("Cliente modificado correctamente");
      } else {
        // --- MODO CREACIÓN (POST) ---
        await clienteService.crear(formulario);
        alert("Cliente creado correctamente");
      }

      // Limpieza final
      cancelarEdicion();
      cargarClientes(); 
    } catch (error) {
      alert("Error al guardar");
    }
  };

  // Prepara el formulario con los datos del cliente a editar
  const cargarParaEditar = (cliente: Cliente) => {
    setIdEdicion(cliente.idCliente);
    setFormulario({
      // Si cliente.nombre es null, usa ''
      nombre: cliente.nombre || '',      
      apellido: cliente.apellido || '',
      // Aquí es donde suele fallar (dirección o teléfono suelen ser nulos)
      direccion: cliente.direccion || '', 
      telefono: cliente.telefono || ''    
    });
    // Hacemos scroll hacia arriba
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setIdEdicion(null);
    setFormulario({ nombre: '', apellido: '', direccion: '', telefono: '' });
  };

  const toggleEstado = async (cliente: Cliente) => {
    try {
      if (cliente.activo) {
        if(confirm(`¿Desactivar a ${cliente.nombre}? Pasará al historial.`)) {
          await clienteService.eliminar(cliente.idCliente);
        }
      } else {
        await clienteService.activar(cliente.idCliente);
      }
      cargarClientes();
    } catch (error) {
      alert("Error cambiando estado");
    }
  };

  return (
    <main className="pb-10">
      <h1 className="text-3xl font-bold mb-6 text-pink-600 border-b pb-2">
        Gestión de Clientes
      </h1>

      {/* --- FORMULARIO INTELIGENTE --- */}
      <div className={`p-6 rounded-lg shadow-md mb-8 border transition-colors ${idEdicion ? 'bg-blue-50 border-blue-200' : 'bg-white border-pink-100'}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-lg font-bold ${idEdicion ? 'text-blue-700' : 'text-gray-700'}`}>
            {idEdicion ? '✏️ Editando Cliente' : '➕ Agregar Nuevo Cliente'}
          </h2>
          
          {idEdicion && (
            <button onClick={cancelarEdicion} className="text-sm text-gray-500 hover:text-gray-700 underline">
              Cancelar Edición
            </button>
          )}
        </div>

        <form onSubmit={handleGuardar} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            type="text" placeholder="Nombre" className="border p-2 rounded"
            value={formulario.nombre}
            onChange={e => setFormulario({...formulario, nombre: e.target.value})}
          />
          <input 
            type="text" placeholder="Apellido" className="border p-2 rounded"
            value={formulario.apellido}
            onChange={e => setFormulario({...formulario, apellido: e.target.value})}
          />
          <input 
            type="text" placeholder="Teléfono" className="border p-2 rounded"
            value={formulario.telefono}
            onChange={e => setFormulario({...formulario, telefono: e.target.value})}
          />
          <input 
            type="text" placeholder="Dirección / Zona" className="border p-2 rounded"
            value={formulario.direccion}
            onChange={e => setFormulario({...formulario, direccion: e.target.value})}
          />
          
          <button 
            type="submit" 
            className={`md:col-span-2 text-white font-bold py-2 rounded transition ${idEdicion ? 'bg-blue-600 hover:bg-blue-700' : 'bg-pink-500 hover:bg-pink-600'}`}
          >
            {idEdicion ? '💾 Guardar Cambios' : '+ Crear Cliente'}
          </button>
        </form>
      </div>

      {loading ? <p>Cargando...</p> : (
        <>
          {/* --- SECCIÓN ACTIVOS --- */}
          <h2 className="text-xl font-bold mb-4 text-gray-800">Cartera Activa ({activos.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
            {activos.map((c) => (
              <div key={c.idCliente} className="bg-white p-4 rounded shadow border-l-4 border-pink-500 hover:shadow-md transition relative group">
                <h3 className="font-bold text-lg text-gray-800">{c.nombre} {c.apellido}</h3>
                <p className="text-gray-600 mt-1">📞 {c.telefono}</p>
                <p className="text-gray-500 text-sm">📍 {c.direccion || 'Sin dirección'}</p>
                
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                  {/* Botón Editar */}
                  <button 
                    onClick={() => cargarParaEditar(c)}
                    className="text-blue-400 hover:text-blue-600"
                    title="Editar datos"
                  >
                    ✏️
                  </button>
                  {/* Botón Borrar */}
                  <button 
                    onClick={() => toggleEstado(c)}
                    className="text-gray-300 hover:text-red-500"
                    title="Desactivar cliente"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {activos.length === 0 && <p className="text-gray-500 col-span-3">No hay clientes activos.</p>}
          </div>

          {/* --- SECCIÓN INACTIVOS --- */}
          {inactivos.length > 0 && (
            <div className="opacity-75">
              <h2 className="text-xl font-bold mb-4 text-gray-500 border-t pt-8">
                🗑️ Clientes Inactivos / Historial
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {inactivos.map((c) => (
                  <div key={c.idCliente} className="bg-gray-100 p-4 rounded border border-gray-200 text-gray-500 flex justify-between items-center group">
                    <div>
                      <h3 className="font-bold text-lg">{c.nombre} {c.apellido}</h3>
                      <p className="text-sm">📞 {c.telefono}</p>
                    </div>
                    
                    <div className="flex gap-3">
                        {/* Editar Inactivo (Opcional, pero útil) */}
                        <button 
                            onClick={() => cargarParaEditar(c)}
                            className="text-blue-300 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition"
                        >
                            ✏️
                        </button>
                        {/* Reactivar */}
                        <button 
                        onClick={() => toggleEstado(c)}
                        className="text-green-600 hover:text-green-800 font-bold text-sm bg-white px-3 py-1 rounded shadow-sm hover:shadow"
                        >
                        ⟳
                        </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}