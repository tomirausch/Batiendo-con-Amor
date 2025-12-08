package com.batiendoconamor.backend.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OpcionRequestDTO {
    private String nombre;          // Ej: "Crema Bariloche"
    private BigDecimal precioExtra; // Ej: 800.00
    private Long idAtributo;        // Ej: 1 (Para decir que es un "Relleno")
}