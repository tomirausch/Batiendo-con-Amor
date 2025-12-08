package com.batiendoconamor.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "producto_atributos")
public class ProductoAtributo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "id_producto")
    private Producto producto;

    @ManyToOne
    @JoinColumn(name = "id_atributo")
    private Atributo atributo;
    
    // Aquí podrías agregar "cantidadMaxima" si quisieras a futuro
}