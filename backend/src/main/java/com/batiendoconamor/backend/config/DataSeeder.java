package com.batiendoconamor.backend.config;

import com.batiendoconamor.backend.entity.*;
import com.batiendoconamor.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired private ClienteRepository clienteRepository;
    @Autowired private ProductoRepository productoRepository;
    @Autowired private AtributoRepository atributoRepository; // Asegúrate de tener este repo
    @Autowired private OpcionAtributoRepository opcionRepository;
    // Si te falta el repo de ProductoAtributo, puedes omitirlo por ahora

    @Override
    public void run(String... args) throws Exception {
        // Solo cargamos datos si la base de datos está vacía
        if (clienteRepository.count() == 0) {
            
            // 1. Crear un Cliente
            Cliente cliente = new Cliente();
            cliente.setNombre("Juan");
            cliente.setApellido("Perez");
            cliente.setTelefono("123456");
            cliente.setActivo(true);
            clienteRepository.save(cliente);

            // 2. Crear un Producto (Torta)
            Producto torta = new Producto();
            torta.setNombre("Torta Base 2kg");
            torta.setUnidad("unidad");
            torta.setPrecioBase(new BigDecimal("5000.00"));
            torta.setActivo(true);
            productoRepository.save(torta);

            // 3. Crear Atributo (Relleno) y sus Opciones
            Atributo relleno = new Atributo();
            relleno.setNombre("Relleno");
            atributoRepository.save(relleno);

            OpcionAtributo ddl = new OpcionAtributo();
            ddl.setNombre("Dulce de Leche");
            ddl.setPrecioExtra(new BigDecimal("500.00"));
            ddl.setAtributo(relleno);
            opcionRepository.save(ddl);

            OpcionAtributo nutella = new OpcionAtributo();
            nutella.setNombre("Nutella");
            nutella.setPrecioExtra(new BigDecimal("1200.00"));
            nutella.setAtributo(relleno);
            opcionRepository.save(nutella);

            System.out.println("✅ DATOS DE PRUEBA CARGADOS EXITOSAMENTE");
        }
    }
}