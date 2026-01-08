package com.batiendoconamor.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@Table(name = "detalle_pedidos")
public class DetallePedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDetalle;

    private BigDecimal cantidad;
    private BigDecimal subtotal;

    // SNAPSHOT DE PRECIO: Guardamos cuánto costaba el producto base ese día
    private BigDecimal precioBaseHistorico;

    // Relación inversa con Pedido
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pedido")
    @ToString.Exclude // Evita bucles infinitos al imprimir logs
    @JsonIgnore
    private Pedido pedido;

    // Relación con el Producto (Unidireccional es suficiente usualmente)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto")
    private Producto producto;

    // Relación con las Opciones (Rellenos, extras, etc.)
    @OneToMany(mappedBy = "detallePedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetalleOpcion> opciones = new ArrayList<>();

    public void agregarOpcion(DetalleOpcion opcion) {
        opciones.add(opcion);
        opcion.setDetallePedido(this);
    }
}