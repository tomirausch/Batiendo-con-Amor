package com.batiendoconamor.backend.controller;

import com.batiendoconamor.backend.dto.request.ClienteRequestDTO;
import com.batiendoconamor.backend.entity.Cliente;
import com.batiendoconamor.backend.service.ClienteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    // GET /api/clientes?soloActivos=true
    @GetMapping
    public ResponseEntity<List<Cliente>> listar(
            @RequestParam(required = false, defaultValue = "true") boolean soloActivos) {
        return ResponseEntity.ok(clienteService.listarClientes(soloActivos));
    }

    @PostMapping
    public ResponseEntity<Cliente> crear(@RequestBody ClienteRequestDTO dto) {
        return ResponseEntity.ok(clienteService.crearCliente(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Cliente> actualizar(@PathVariable Long id, @RequestBody ClienteRequestDTO dto) {
        return ResponseEntity.ok(clienteService.actualizarCliente(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        clienteService.eliminarCliente(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/activar")
    public ResponseEntity<Void> activar(@PathVariable Long id) {
        clienteService.activarCliente(id);
        return ResponseEntity.ok().build();
    }
}