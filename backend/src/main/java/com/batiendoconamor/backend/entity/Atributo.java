package com.batiendoconamor.backend.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "atributos")
public class Atributo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idAtributo;

    private String nombre; // Ej: "Relleno", "Tamaño", "Decoración"
}