package com.batiendoconamor.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;

@Entity
@Data
@Table(name = "opcion_atributos")
public class OpcionAtributo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOpcion;

    private String nombre; // Ej: "Dulce de Leche", "Sin TACC"
    private BigDecimal precioExtra; // Ej: 500.00

    // Relación con el Atributo padre (Ej: Esta opción pertenece al atributo "Relleno")
    @ManyToOne
    @JoinColumn(name = "id_atributo")
    private Atributo atributo;
}