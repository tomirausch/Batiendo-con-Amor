package com.batiendoconamor.backend.controller;

import com.batiendoconamor.backend.dto.request.PedidoRequestDTO;
import com.batiendoconamor.backend.entity.Pedido;
import com.batiendoconamor.backend.service.PedidoService;

import jakarta.validation.Valid;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @Autowired
    private PedidoService pedidoService;

    @PostMapping
    public ResponseEntity<Pedido> crear(@Valid @RequestBody PedidoRequestDTO dto) {
        return ResponseEntity.ok(pedidoService.crearPedido(dto));
    }

    @GetMapping
    public ResponseEntity<List<Pedido>> listarPedidos() {
        return ResponseEntity.ok(pedidoService.listarTodos());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelar(@PathVariable Long id) {
        pedidoService.cancelarPedido(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/entregar")
    public ResponseEntity<Void> entregar(@PathVariable Long id) {
        pedidoService.entregarPedido(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/pagar")
    public ResponseEntity<Void> pagar(@PathVariable Long id) {
        pedidoService.confirmarPago(id);
        return ResponseEntity.ok().build();
    }
}