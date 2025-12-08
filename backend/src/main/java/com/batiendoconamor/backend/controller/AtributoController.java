package com.batiendoconamor.backend.controller;

import com.batiendoconamor.backend.entity.Atributo;
import com.batiendoconamor.backend.repository.AtributoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/atributos")
public class AtributoController {

    @Autowired
    private AtributoRepository atributoRepository;

    @GetMapping
    public ResponseEntity<List<Atributo>> listar() {
        return ResponseEntity.ok(atributoRepository.findAll());
    }
    
    @PostMapping
    public ResponseEntity<Atributo> crear(@RequestBody Atributo atributo) {
        return ResponseEntity.ok(atributoRepository.save(atributo));
    }
}