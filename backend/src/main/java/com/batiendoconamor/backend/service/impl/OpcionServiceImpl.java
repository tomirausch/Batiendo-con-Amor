package com.batiendoconamor.backend.service.impl;

import com.batiendoconamor.backend.dto.request.OpcionRequestDTO;
import com.batiendoconamor.backend.entity.Atributo;
import com.batiendoconamor.backend.entity.OpcionAtributo;
import com.batiendoconamor.backend.repository.AtributoRepository;
import com.batiendoconamor.backend.repository.OpcionAtributoRepository;
import com.batiendoconamor.backend.service.OpcionService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OpcionServiceImpl implements OpcionService{

    @Autowired private OpcionAtributoRepository opcionRepository;
    @Autowired private AtributoRepository atributoRepository;

    public List<OpcionAtributo> listarTodas() {
        return opcionRepository.findAll();
    }

    // Método extra útil: Listar opciones por atributo (Ej: Dame todos los Rellenos)
    // Para esto necesitarías agregar "findByAtributo_IdAtributo" en el repositorio, 
    // pero por ahora usemos listarTodas para no complicar.

    public OpcionAtributo crearOpcion(OpcionRequestDTO dto) {
        // 1. Buscamos el papá (El atributo)
        Atributo atributo = atributoRepository.findById(dto.getIdAtributo())
                .orElseThrow(() -> new RuntimeException("El atributo (Relleno/Decoración) no existe"));

        // 2. Creamos el hijo
        OpcionAtributo opcion = new OpcionAtributo();
        opcion.setNombre(dto.getNombre());
        opcion.setPrecioExtra(dto.getPrecioExtra());
        opcion.setAtributo(atributo); // Vinculamos

        return opcionRepository.save(opcion);
    }

    public OpcionAtributo actualizarOpcion(Long id, OpcionRequestDTO dto) {
        OpcionAtributo opcion = opcionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Opción no encontrada"));

        opcion.setNombre(dto.getNombre());
        opcion.setPrecioExtra(dto.getPrecioExtra());
        
        // Opcional: Permitir cambiar de categoría (ej: era relleno, ahora es cobertura)
        if(dto.getIdAtributo() != null) {
             Atributo atributo = atributoRepository.findById(dto.getIdAtributo())
                .orElseThrow(() -> new RuntimeException("Atributo no encontrado"));
             opcion.setAtributo(atributo);
        }

        return opcionRepository.save(opcion);
    }

    public void eliminarOpcion(Long id) {
        // CUIDADO: Si eliminas una opción que ya se usó en un pedido viejo,
        // la base de datos podría dar error por FK (Foreign Key).
        // Por ahora lo dejamos así, pero en el futuro idealmente usaríamos "activo = false"
        opcionRepository.deleteById(id);
    }
}