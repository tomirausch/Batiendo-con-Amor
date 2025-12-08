package com.batiendoconamor.backend.service;

import java.util.List;

import com.batiendoconamor.backend.entity.Gasto;

public interface GastoService {
    public List<Gasto> listar();

    public Gasto registrar(Gasto gasto);

    public void eliminar(Long id);
}
