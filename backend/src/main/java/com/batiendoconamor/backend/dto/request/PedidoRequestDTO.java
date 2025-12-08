package com.batiendoconamor.backend.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

@Data
public class PedidoRequestDTO {
    // ID del cliente que hace el pedido
    private Long idCliente;
    
    // Fecha prometida de entrega
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate fechaEntrega;
    
    // Lista de productos solicitados
    private List<DetalleRequestDTO> detalles;

    private String observaciones;
}