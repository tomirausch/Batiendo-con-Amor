package com.batiendoconamor.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.batiendoconamor.backend.entity.Atributo;

@Repository
public interface AtributoRepository extends JpaRepository<Atributo, Long>{
    
}
