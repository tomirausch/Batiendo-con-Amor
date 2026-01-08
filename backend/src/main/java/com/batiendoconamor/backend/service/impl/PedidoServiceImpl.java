package com.batiendoconamor.backend.service.impl;

import com.batiendoconamor.backend.dto.request.DetalleRequestDTO;
import com.batiendoconamor.backend.dto.request.PedidoRequestDTO;
import com.batiendoconamor.backend.entity.*;
import com.batiendoconamor.backend.repository.*;
import com.batiendoconamor.backend.service.PedidoService;

import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PedidoServiceImpl implements PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;
    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private OpcionAtributoRepository opcionRepository;
    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional // Importante: Si algo falla, hace rollback de todo
    public Pedido crearPedido(PedidoRequestDTO dto) {

        // 1. Crear la cabecera del pedido
        Pedido pedido = new Pedido();
        pedido.setFechaEmitido(LocalDateTime.now());
        pedido.setFechaEntrega(dto.getFechaEntrega().atStartOfDay()); // Convertimos LocalDate a LocalDateTime

        // Buscamos el cliente (lanzamos error si no existe)
        Cliente cliente = clienteRepository.findById(dto.getIdCliente())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        if (!cliente.isActivo()) {
            throw new RuntimeException("No se puede crear pedido: El cliente está inactivo o bloqueado");
        }
        pedido.setCliente(cliente);

        // Procesar precio adicional (si viene null, asumimos 0)
        BigDecimal precioAdicional = dto.getPrecioAdicional() != null ? dto.getPrecioAdicional() : BigDecimal.ZERO;
        pedido.setPrecioAdicional(precioAdicional);

        // Iniciamos el total con el precio adicional
        BigDecimal totalPedido = precioAdicional;

        // 2. Iterar sobre los productos del JSON
        for (DetalleRequestDTO detDto : dto.getDetalles()) {
            DetallePedido detalle = new DetallePedido();

            // A. Buscar Producto y congelar precio base
            Producto producto = productoRepository.findById(detDto.getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

            if (!producto.isActivo()) {
                throw new RuntimeException(
                        "El producto '" + producto.getNombre() + "' no está disponible para la venta");
            }

            detalle.setProducto(producto);
            detalle.setCantidad(detDto.getCantidad());
            detalle.setPrecioBaseHistorico(producto.getPrecioBase()); // <--- SNAPSHOT
            pedido.setObservaciones(dto.getObservaciones());

            // B. Calcular subtotal inicial (Precio Base * Cantidad)
            BigDecimal subtotalDetalle = producto.getPrecioBase()
                    .multiply(detDto.getCantidad());

            // C. Procesar Opciones (Rellenos, etc.)
            if (detDto.getIdsOpciones() != null) {
                for (Long idOpcion : detDto.getIdsOpciones()) {
                    DetalleOpcion detOpcion = new DetalleOpcion();

                    OpcionAtributo opcion = opcionRepository.findById(idOpcion)
                            .orElseThrow(() -> new RuntimeException("Opción no encontrada"));

                    detOpcion.setOpcionAtributo(opcion);
                    detOpcion.setPrecioExtraHistorico(opcion.getPrecioExtra()); // <--- SNAPSHOT

                    // Vinculamos (Relación Padre-Hijo)
                    detalle.agregarOpcion(detOpcion);

                    // Sumar al subtotal del detalle: (Precio Extra * Cantidad de productos)
                    // Ej: Si son 2 tortas, el extra de "frutillas" se cobra 2 veces
                    BigDecimal costoExtraTotal = opcion.getPrecioExtra()
                            .multiply(detDto.getCantidad());

                    subtotalDetalle = subtotalDetalle.add(costoExtraTotal);
                }
            }

            detalle.setSubtotal(subtotalDetalle);

            // Vinculamos detalle al pedido
            pedido.agregarDetalle(detalle);

            // Sumamos al total general
            totalPedido = totalPedido.add(subtotalDetalle);
        }

        pedido.setTotal(totalPedido);

        // 3. Guardar todo en cascada
        return pedidoRepository.save(pedido);
    }

    public List<Pedido> listarTodos() {
        return pedidoRepository.findAll();
    }

    public void cancelarPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        pedido.setCancelado(true);
        pedidoRepository.save(pedido);
    }

    public void entregarPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (pedido.isCancelado()) {
            throw new RuntimeException("No se puede entregar un pedido cancelado");
        }

        pedido.setEntregado(true);
        pedidoRepository.save(pedido);
    }

    public void confirmarPago(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        if (pedido.isCancelado()) {
            throw new RuntimeException("No se puede pagar un pedido cancelado");
        }

        pedido.setPagado(true);
        pedidoRepository.save(pedido);
    }
}