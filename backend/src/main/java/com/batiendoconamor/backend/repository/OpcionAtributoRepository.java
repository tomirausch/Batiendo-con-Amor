package com.batiendoconamor.backend.repository;

import com.batiendoconamor.backend.entity.OpcionAtributo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OpcionAtributoRepository extends JpaRepository<OpcionAtributo, Long> {
}