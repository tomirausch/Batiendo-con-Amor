package com.batiendoconamor.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;
import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Data
@Table(name = "detalle_opciones")
public class DetalleOpcion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDetalleOpcion;

    // SNAPSHOT DE PRECIO EXTRA: Guardamos el precio del extra ese día
    private BigDecimal precioExtraHistorico;

    // Relación inversa con el Detalle Padre
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_detalle")
    @ToString.Exclude
    @JsonIgnore
    private DetallePedido detallePedido;

    // Referencia a qué opción eligió (Ej: "Dulce de Leche")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_opcion_atributo")
    private OpcionAtributo opcionAtributo;
}