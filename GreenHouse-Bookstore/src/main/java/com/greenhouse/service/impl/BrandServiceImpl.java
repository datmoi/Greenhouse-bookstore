package com.greenhouse.service.impl;

import com.greenhouse.model.Brands;
import com.greenhouse.repository.BrandRepository;
import com.greenhouse.service.BrandService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BrandServiceImpl implements BrandService {

    @Autowired
    private BrandRepository brandRepository;

    @Override
    public List<Brands> findAll() {
        return brandRepository.findAll();
    }

    @Override
    public Brands findById(String brandId) {
        Optional<Brands> result = brandRepository.findById(brandId);
        return result.orElse(null);
    }

    @Override
    public Brands add(Brands brand) {
        return brandRepository.save(brand);
    }

    @Override
    public void update(Brands brand) {
        brandRepository.save(brand);
    }

    @Override
    public void delete(String brandId) {
        brandRepository.deleteById(brandId);
    }
}
