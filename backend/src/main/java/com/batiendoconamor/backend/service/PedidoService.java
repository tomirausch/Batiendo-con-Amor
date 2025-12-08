package com.batiendoconamor.backend.service;

import java.util.List;

import com.batiendoconamor.backend.dto.request.PedidoRequestDTO;
import com.batiendoconamor.backend.entity.Pedido;

import jakarta.transaction.Transactional;

public interface PedidoService {
    @Transactional
    public Pedido crearPedido(PedidoRequestDTO dto);
    
    public List<Pedido> listarTodos();
}
