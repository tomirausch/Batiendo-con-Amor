package com.batiendoconamor.backend.dto.request;

import lombok.Data;

@Data
public class ClienteRequestDTO {
    private String nombre;
    private String apellido;
    private String direccion;
    private String telefono;
}