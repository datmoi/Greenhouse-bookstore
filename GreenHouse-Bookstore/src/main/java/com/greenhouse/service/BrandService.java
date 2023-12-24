package com.greenhouse.service;

import com.greenhouse.model.Brands;

import java.util.List;

public interface BrandService {

    List<Brands> findAll();

    Brands findById(String brandId);

    Brands add(Brands entity);

    void update(Brands entity);

    void delete(String brandId);
}
