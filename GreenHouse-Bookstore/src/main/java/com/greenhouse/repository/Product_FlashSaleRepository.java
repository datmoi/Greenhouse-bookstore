package com.greenhouse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.greenhouse.model.Flash_Sales;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Product_Flash_Sale;

public interface Product_FlashSaleRepository extends JpaRepository<Product_Flash_Sale, Integer> {

    List<Product_Flash_Sale> findByFlashSaleId(Flash_Sales id);

    Product_Flash_Sale findByFlashSaleIdAndProductDetail(Flash_Sales flashSaleId, Product_Detail pDetail);
   

}
