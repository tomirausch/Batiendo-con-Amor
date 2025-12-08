package com.batiendoconamor.backend.dto.request;

import lombok.Data;
import java.util.List;

@Data
public class DetalleRequestDTO {
    // ID del producto base (ej: Torta Vainilla)
    private Long idProducto;
    
    // Cuántas unidades quiere
    private Integer cantidad;
    
    // IDs de los rellenos o extras (ej: [5, 20, 33])
    // Puede ser null si no eligió nada extra
    private List<Long> idsOpciones; 
}