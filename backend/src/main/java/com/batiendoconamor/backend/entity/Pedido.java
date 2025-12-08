package com.batiendoconamor.backend.entity;

import jakarta.persistence.*;
import lombok.Data; // Asumo que conoces Lombok para ahorrar getters/setters
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data // Genera getters, setters, toString, etc.
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idPedido;

    // Usamos LocalDateTime para tener fecha Y hora exacta
    private LocalDateTime fechaEmitido;
    private LocalDateTime fechaEntrega;

    // BigDecimal es OBLIGATORIO para dinero. Double pierde precisión en decimales.
    private BigDecimal total;

    // Relación con Cliente (ManyToOne)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_cliente")
    private Cliente cliente;

    // Relación Uno a Muchos con Detalle
    // mappedBy: indica que el dueño de la relación es el campo "pedido" en
    // DetallePedido
    // orphanRemoval = true: Si borras un detalle de la lista, se borra de la BD.
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<DetallePedido> detalles = new ArrayList<>();

    @Column(length = 500)
    private String observaciones;

    private boolean cancelado = false;

    // Método helper para mantener la consistencia bidireccional
    public void agregarDetalle(DetallePedido detalle) {
        detalles.add(detalle);
        detalle.setPedido(this);
    }
}