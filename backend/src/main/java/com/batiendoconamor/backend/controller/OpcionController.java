package com.batiendoconamor.backend.controller;

import com.batiendoconamor.backend.dto.request.OpcionRequestDTO;
import com.batiendoconamor.backend.entity.OpcionAtributo;
import com.batiendoconamor.backend.service.OpcionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/opciones")
public class OpcionController {

    @Autowired
    private OpcionService opcionService;

    @GetMapping
    public ResponseEntity<List<OpcionAtributo>> listar() {
        return ResponseEntity.ok(opcionService.listarTodas());
    }

    @PostMapping
    public ResponseEntity<OpcionAtributo> crear(@RequestBody OpcionRequestDTO dto) {
        return ResponseEntity.ok(opcionService.crearOpcion(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OpcionAtributo> actualizar(@PathVariable Long id, @RequestBody OpcionRequestDTO dto) {
        return ResponseEntity.ok(opcionService.actualizarOpcion(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        opcionService.eliminarOpcion(id);
        return ResponseEntity.noContent().build();
    }
}