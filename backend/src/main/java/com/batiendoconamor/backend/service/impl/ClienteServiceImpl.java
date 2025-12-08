package com.batiendoconamor.backend.service.impl;

import com.batiendoconamor.backend.dto.request.ClienteRequestDTO;
import com.batiendoconamor.backend.entity.Cliente;
import com.batiendoconamor.backend.repository.ClienteRepository;
import com.batiendoconamor.backend.service.ClienteService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClienteServiceImpl implements ClienteService{

    @Autowired
    private ClienteRepository clienteRepository;

    // 1. LISTAR
    public List<Cliente> listarClientes(boolean soloActivos) {
        /* Nota: Para que esto funcione, asegúrate de tener en ClienteRepository:
           List<Cliente> findByActivoTrue();
        */
        if (soloActivos) {
            return clienteRepository.findByActivoTrue();
        }
        return clienteRepository.findAll();
    }

    // 2. CREAR
    public Cliente crearCliente(ClienteRequestDTO dto) {
        Cliente cliente = new Cliente();
        cliente.setNombre(dto.getNombre());
        cliente.setApellido(dto.getApellido());
        cliente.setDireccion(dto.getDireccion());
        cliente.setTelefono(dto.getTelefono());
        cliente.setActivo(true); // Nace activo
        
        return clienteRepository.save(cliente);
    }

    // 3. ACTUALIZAR (Ej: Se mudó de casa)
    public Cliente actualizarCliente(Long id, ClienteRequestDTO dto) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        cliente.setNombre(dto.getNombre());
        cliente.setApellido(dto.getApellido());
        cliente.setDireccion(dto.getDireccion());
        cliente.setTelefono(dto.getTelefono());
        
        return clienteRepository.save(cliente);
    }

    // 4. ELIMINAR (Borrado Lógico - Bloquear cliente)
    public void eliminarCliente(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        
        cliente.setActivo(false); // <--- Lo desactivamos
        clienteRepository.save(cliente);
    }

    public void activarCliente(Long id) {
        Cliente cliente = clienteRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));
        
        cliente.setActivo(true);
        clienteRepository.save(cliente);
    }
}