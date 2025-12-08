package com.batiendoconamor.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductoRequestDTO {
    
    @NotBlank(message = "El nombre del producto no puede estar vacío")
    private String nombre;      

    @NotBlank(message = "La unidad de medida es obligatoria")
    private String unidad;     
    
    @NotNull(message = "El precio es obligatorio")
    @Positive(message = "El precio debe ser mayor a cero")
    private BigDecimal precioBase; 

    private List<Long> idsAtributosValidos;
}