package com.batiendoconamor.backend.service;

import java.util.List;

import com.batiendoconamor.backend.dto.request.ProductoRequestDTO;
import com.batiendoconamor.backend.entity.Producto;

public interface ProductoService {
    public List<Producto> listarProductos(boolean soloActivos);
    public Producto crearProducto(ProductoRequestDTO dto);
    public Producto actualizarProducto(Long id, ProductoRequestDTO dto);
    public void eliminarProducto(Long id);
    public void activarProducto(Long id);
}
