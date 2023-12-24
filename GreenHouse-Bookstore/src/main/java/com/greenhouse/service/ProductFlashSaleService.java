package com.greenhouse.service;

import com.greenhouse.model.Product_Flash_Sale;

import java.util.List;

public interface ProductFlashSaleService {

    List<Product_Flash_Sale> findAll();

    Product_Flash_Sale findById(Integer id);

    void add(Product_Flash_Sale entity);

    void update(Product_Flash_Sale entity);

    void delete(Integer id);

    List<Product_Flash_Sale> findByProductFSId(Integer flashSale);

}
