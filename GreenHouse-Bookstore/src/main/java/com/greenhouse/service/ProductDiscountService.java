package com.greenhouse.service;

import com.greenhouse.model.Discounts;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Product_Discount;

import java.util.List;

public interface ProductDiscountService {

    List<Product_Discount> findAll();

    Product_Discount findById(Integer id);

    void add(Product_Discount entity);

    void update(Product_Discount entity);

    void delete(Integer id);

    // Trong ProductDiscountService.java
    void delete(Product_Discount entity);

    List<Product_Discount> findByDiscount(Discounts discount);

    Product_Discount findByProductDetail(Product_Detail productDetail);
}
