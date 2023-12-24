package com.greenhouse.dto;

import java.util.List;

import com.greenhouse.model.Flash_Sales;
import com.greenhouse.model.Product_Flash_Sale;

import lombok.Data;

@Data
public class FlashSaleRequest {

    private Flash_Sales flashSale;
    private List<Product_Flash_Sale> productFlashSales;
    private List<Product_Flash_Sale> listDeletedProductFlashSale;
    // Constructors, getters, and setters
}
