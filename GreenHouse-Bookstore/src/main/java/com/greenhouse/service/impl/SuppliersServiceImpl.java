package com.greenhouse.service.impl;

import com.greenhouse.model.Suppliers;
import com.greenhouse.repository.SuppliersRepository;
import com.greenhouse.service.SuppliersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SuppliersServiceImpl implements SuppliersService {

    @Autowired
    private SuppliersRepository suppliersRepository;

    @Override
    public List<Suppliers> findAll() {
        return suppliersRepository.findAll();
    }

    @Override
    public Suppliers findById(String supplierId) {
        Optional<Suppliers> result = suppliersRepository.findById(supplierId);
        return result.orElse(null);
    }

    @Override
    public Suppliers add(Suppliers supplier) {
        return suppliersRepository.save(supplier);
    }

    @Override
    public Suppliers update(Suppliers supplier) {
        return suppliersRepository.save(supplier);
    }

    @Override
    public void delete(String supplierId) {
        suppliersRepository.deleteById(supplierId);
    }
}
