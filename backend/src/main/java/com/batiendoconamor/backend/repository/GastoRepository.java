package com.batiendoconamor.backend.repository;

import com.batiendoconamor.backend.entity.Gasto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GastoRepository extends JpaRepository<Gasto, Long> {
    // Aquí podríamos agregar filtros por fecha en el futuro
}