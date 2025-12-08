package com.batiendoconamor.backend.service;

import java.util.List;

import com.batiendoconamor.backend.dto.request.ClienteRequestDTO;
import com.batiendoconamor.backend.entity.Cliente;

public interface ClienteService {
    public List<Cliente> listarClientes(boolean soloActivos);
    public Cliente crearCliente(ClienteRequestDTO dto);
    public Cliente actualizarCliente(Long id, ClienteRequestDTO dto);
    public void eliminarCliente(Long id);
    public void activarCliente(Long id);
}
