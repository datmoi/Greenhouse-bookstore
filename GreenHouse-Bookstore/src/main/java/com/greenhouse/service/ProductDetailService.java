package com.greenhouse.service;

import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Products;

import java.util.List;

public interface ProductDetailService {

    List<Product_Detail> findAll();

    Product_Detail findById(Integer productDetailId);

    Product_Detail add(Product_Detail entity);

    Product_Detail update(Product_Detail entity);

    void delete(Integer productDetailId);

    List<Object[]> findAllInventoryList();

    List<Product_Detail> findProductsByStatus();

    List<Product_Detail> findByProduct(Products product);

    boolean existsByProduct(Products product);
}
