package com.greenhouse.service;

import com.greenhouse.model.Products;

import java.io.IOException;
import java.util.List;

import org.springframework.web.multipart.MultipartFile;

public interface ProductsService {

    List<Products> findAll();

    Products findById(String productId);

    Products add(Products entity);

    Products update(Products entity);

    void delete(String productId);

    List<Products> importProducts(MultipartFile file) throws IOException;

}
