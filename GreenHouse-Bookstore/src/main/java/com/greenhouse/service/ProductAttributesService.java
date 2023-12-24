package com.greenhouse.service;

import com.greenhouse.model.ProductAttributes;

import java.util.List;

public interface ProductAttributesService {

    List<ProductAttributes> findAll();

    ProductAttributes findById(Integer id);

    ProductAttributes add(ProductAttributes entity);

    ProductAttributes update(ProductAttributes entity);

    void delete(Integer id);
}
