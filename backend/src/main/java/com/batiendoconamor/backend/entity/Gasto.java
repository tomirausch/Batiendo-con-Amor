package com.batiendoconamor.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Data
@Table(name = "gastos")
public class Gasto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idGasto;

    private String descripcion; // Ej: "10kg Harina", "Pago Luz"
    private BigDecimal monto;
    private LocalDate fecha;
}