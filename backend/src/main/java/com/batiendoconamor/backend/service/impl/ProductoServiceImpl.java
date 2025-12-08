package com.batiendoconamor.backend.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.batiendoconamor.backend.dto.request.ProductoRequestDTO;
import com.batiendoconamor.backend.entity.Atributo;
import com.batiendoconamor.backend.entity.Producto;
import com.batiendoconamor.backend.repository.AtributoRepository;
import com.batiendoconamor.backend.repository.ProductoRepository;
import com.batiendoconamor.backend.service.ProductoService;

import java.util.HashSet;
import java.util.List;

@Service
public class ProductoServiceImpl implements ProductoService{
    @Autowired private ProductoRepository productoRepository;
    @Autowired private AtributoRepository atributoRepository;

    // 1. LISTAR (Solo los activos para vender, o todos para administrar)
    public List<Producto> listarProductos(boolean soloActivos) {
        if (soloActivos) {
            return productoRepository.findByActivoTrue(); // Este método ya lo creamos en el Repository
        }
        return productoRepository.findAll();
    }

    // 2. CREAR
    public Producto crearProducto(ProductoRequestDTO dto) {
        Producto producto = new Producto();
        producto.setNombre(dto.getNombre());
        producto.setUnidad(dto.getUnidad());
        producto.setPrecioBase(dto.getPrecioBase());
        producto.setActivo(true); // Nace activo por defecto

        if (dto.getIdsAtributosValidos() != null) {
            List<Atributo> atributos = atributoRepository.findAllById(dto.getIdsAtributosValidos());
            producto.setAtributosValidos(new HashSet<>(atributos));
        }
        
        return productoRepository.save(producto);
    }

    // 3. EDITAR (Actualizar precio o nombre)
    public Producto actualizarProducto(Long id, ProductoRequestDTO dto) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        producto.setNombre(dto.getNombre());
        producto.setUnidad(dto.getUnidad());
        producto.setPrecioBase(dto.getPrecioBase());

        if (dto.getIdsAtributosValidos() != null) {
            List<Atributo> atributos = atributoRepository.findAllById(dto.getIdsAtributosValidos());
            producto.setAtributosValidos(new HashSet<>(atributos));
        }
        
        return productoRepository.save(producto);
    }

    // 4. ELIMINAR (Borrado Lógico)
    public void eliminarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        producto.setActivo(false); // <--- Aquí está la magia
        productoRepository.save(producto);
    }

    public void activarProducto(Long id) {
        Producto producto = productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
        
        producto.setActivo(true); // <--- ¡Resucita!
        productoRepository.save(producto);
    }
}
