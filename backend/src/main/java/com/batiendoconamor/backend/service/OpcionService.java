package com.batiendoconamor.backend.service;

import java.util.List;

import com.batiendoconamor.backend.dto.request.OpcionRequestDTO;
import com.batiendoconamor.backend.entity.OpcionAtributo;

public interface OpcionService {

    public List<OpcionAtributo> listarTodas();
    public OpcionAtributo crearOpcion(OpcionRequestDTO dto);
    public OpcionAtributo actualizarOpcion(Long id, OpcionRequestDTO dto);
    public void eliminarOpcion(Long id);
}
