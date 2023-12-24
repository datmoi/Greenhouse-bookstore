package com.greenhouse.service.impl;

import com.greenhouse.model.ProductAttributes;
import com.greenhouse.repository.ProductAttributesRepository;
import com.greenhouse.service.ProductAttributesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductAttributesServiceImpl implements ProductAttributesService {

    @Autowired
    private ProductAttributesRepository productAttributesRepository;

    @Override
    public List<ProductAttributes> findAll() {
        return productAttributesRepository.findAll();
    }

    @Override
    public ProductAttributes findById(Integer id) {
        Optional<ProductAttributes> result = productAttributesRepository.findById(id);
        return result.orElse(null);
    }

    @Override
    public ProductAttributes add(ProductAttributes productAttributes) {
        return productAttributesRepository.save(productAttributes);
    }

    @Override
    public ProductAttributes update(ProductAttributes productAttributes) {
        return productAttributesRepository.save(productAttributes);
    }

    @Override
    public void delete(Integer id) {
        productAttributesRepository.deleteById(id);
    }
}
