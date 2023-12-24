package com.greenhouse.dto;

import com.greenhouse.model.Discounts;
import com.greenhouse.model.Product_Detail;

import java.util.List;

public class ProductDiscountRequest {

    private Discounts discount;
    private List<Product_Detail> productDetails;

    // Constructors, getters, and setters

    public ProductDiscountRequest() {
    }

    public ProductDiscountRequest(Discounts discount, List<Product_Detail> productDetails) {
        this.discount = discount;
        this.productDetails = productDetails;
    }

    public Discounts getDiscount() {
        return discount;
    }

    public void setDiscount(Discounts discount) {
        this.discount = discount;
    }

    public List<Product_Detail> getProductDetails() {
        return productDetails;
    }

    public void setProductDetails(List<Product_Detail> productDetails) {
        this.productDetails = productDetails;
    }
}
