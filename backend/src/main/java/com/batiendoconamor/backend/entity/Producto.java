package com.batiendoconamor.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

@Entity
@Data
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idProducto;

    private String nombre; // Ej: "Torta Base", "Alfajores"
    private String unidad; // Ej: "kg", "docena", "unidad"
    private BigDecimal precioBase;
    private boolean activo;

    @ManyToMany(fetch = FetchType.EAGER) // EAGER para que cargue la lista al traer el producto
    @JoinTable(
        name = "producto_atributos_validos",
        joinColumns = @JoinColumn(name = "id_producto"),
        inverseJoinColumns = @JoinColumn(name = "id_atributo")
    )
    private Set<Atributo> atributosValidos = new HashSet<>();
}