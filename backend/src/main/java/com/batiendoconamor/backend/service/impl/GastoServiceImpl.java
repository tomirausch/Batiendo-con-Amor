package com.batiendoconamor.backend.service.impl;

import com.batiendoconamor.backend.service.GastoService;

import com.batiendoconamor.backend.entity.Gasto;
import com.batiendoconamor.backend.repository.GastoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GastoServiceImpl implements GastoService{

    @Autowired private GastoRepository gastoRepository;

    public List<Gasto> listar() {
        return gastoRepository.findAll();
    }

    public Gasto registrar(Gasto gasto) {
        return gastoRepository.save(gasto);
    }

    public void eliminar(Long id) {
        gastoRepository.deleteById(id);
    }
}

