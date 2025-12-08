package com.batiendoconamor.backend.dto.request;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonFormat;

import jakarta.validation.constraints.FutureOrPresent;

@Data
public class PedidoRequestDTO {
    // ID del cliente que hace el pedido
    private Long idCliente;

    // Fecha prometida de entrega
    @JsonFormat(pattern = "yyyy-MM-dd")
    @FutureOrPresent(message = "La fecha de entrega debe ser hoy o en el futuro")
    private LocalDate fechaEntrega;

    // Lista de productos solicitados
    private List<DetalleRequestDTO> detalles;

    private String observaciones;
}