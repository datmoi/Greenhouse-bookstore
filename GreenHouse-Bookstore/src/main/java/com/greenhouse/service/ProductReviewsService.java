package com.greenhouse.service;

import com.greenhouse.model.Product_Reviews;

import java.util.List;

public interface ProductReviewsService {

    List<Product_Reviews> findAll();

    Product_Reviews findById(Integer reviewId);

    void add(Product_Reviews entity);

    void update(Product_Reviews entity);

    void delete(Integer reviewId);
}
