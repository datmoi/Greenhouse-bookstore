package com.greenhouse.dto;

import com.greenhouse.model.*;
import lombok.Data;

import java.util.List;

@Data
public class ProductDTO {

    private Products product;
    private Categories category;
    private Authors author;
    private Discounts discount;
    private Product_Detail productDetail;
    private Book_Authors bookAuthors;
    private ProductPriceHistories productPriceHistories;
    private Product_Category productCategory;
    private Product_Discount productDiscount;
    private List<Product_Images> productImages;
    private ProductAttributes productAttributes;
    private List<Attribute_Value> attributeValues;
}
