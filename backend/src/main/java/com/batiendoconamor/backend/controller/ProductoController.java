package com.batiendoconamor.backend.controller;

import org.springframework.web.bind.annotation.RestController;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.batiendoconamor.backend.dto.request.ProductoRequestDTO;
import com.batiendoconamor.backend.entity.Producto;
import com.batiendoconamor.backend.service.ProductoService;

import jakarta.validation.Valid;

import java.util.List;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    
    @Autowired
    private ProductoService productoService;

    @PostMapping
    public ResponseEntity<Producto> crear(@RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.ok(productoService.crearProducto(dto));
    }

    @GetMapping
    public ResponseEntity<List<Producto>> listar(@RequestParam(required = false, defaultValue = "true") boolean soloActivos) {
        return ResponseEntity.ok(productoService.listarProductos(soloActivos));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Producto> actualizar(@PathVariable Long id, @RequestBody ProductoRequestDTO dto) {
        return ResponseEntity.ok(productoService.actualizarProducto(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@Valid @PathVariable Long id){
        productoService.eliminarProducto(id);
        return ResponseEntity.noContent().build();
    }

    // PUT /api/productos/{id}/activar
    @PutMapping("/{id}/activar")
    public ResponseEntity<Void> activar(@Valid @PathVariable Long id) {
        productoService.activarProducto(id);
        return ResponseEntity.ok().build();
    }
}
