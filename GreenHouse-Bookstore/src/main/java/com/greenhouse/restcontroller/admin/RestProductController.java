package com.greenhouse.restcontroller.admin;

import com.greenhouse.model.*;
import com.greenhouse.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest")
public class RestProductController {

    @Autowired
    private AttributeValueService attributeValueService;

    @Autowired
    private BookAuthorsService bookAuthorsService;

    @Autowired
    private ProductAttributesService productAttributesService;

    @Autowired
    private ProductCategoryService productCategoryService;

    @Autowired
    private ProductDetailService productDetailService;

    @Autowired
    private ProductDiscountService productDiscountService;

    @Autowired
    private ProductImagesService productImagesService;

    @Autowired
    private ProductPriceHistoriesService productPriceHistoriesService;

    // Attribute Values
    @GetMapping("/attributeValues")
    public ResponseEntity<List<Attribute_Value>> getAllAttributeValues() {
        List<Attribute_Value> attributeValues = attributeValueService.findAll();
        return ResponseEntity.ok(attributeValues);
    }

    // Book Authors
    @GetMapping("/bookAuthors")
    public ResponseEntity<List<Book_Authors>> getAllBookAuthors() {
        List<Book_Authors> bookAuthors = bookAuthorsService.findAll();
        return ResponseEntity.ok(bookAuthors);
    }

    // Product Attributes
    @GetMapping("/productAttributes")
    public ResponseEntity<List<ProductAttributes>> getAllProductAttributes() {
        List<ProductAttributes> productAttributes = productAttributesService.findAll();
        return ResponseEntity.ok(productAttributes);
    }

    // Product categories
    @GetMapping("/productCategories")
    public ResponseEntity<List<Product_Category>> getAllProductCategories() {
        List<Product_Category> productCategories = productCategoryService.findAll();
        return ResponseEntity.ok(productCategories);
    }

    // Product Details
    @GetMapping("/productDetails")
    public ResponseEntity<List<Product_Detail>> getAllProductDetails() {
        List<Product_Detail> productDetails = productDetailService.findAll();
        return ResponseEntity.ok(productDetails);
    }

    @PutMapping("/productDetails/{id}")
    public ResponseEntity<Product_Detail> updateProductDetail(@PathVariable Integer id,
            @RequestBody Product_Detail productDetail) {
        Product_Detail existingProductDetail = productDetailService.findById(id);
        if (existingProductDetail == null) {
            return ResponseEntity.notFound().build();
        }
        productDetail.setProductDetailId(id);
        Product_Detail updatedProductDetail = productDetailService.update(productDetail);
        return ResponseEntity.ok(updatedProductDetail);
    }

    // Product Discounts
    @GetMapping("/productDiscounts")
    public ResponseEntity<List<Product_Discount>> getAllProductDiscounts() {
        List<Product_Discount> productDiscounts = productDiscountService.findAll();
        return ResponseEntity.ok(productDiscounts);
    }

    // Product Images
    @GetMapping("/productImages")
    public ResponseEntity<List<Product_Images>> getAllProductImages() {
        List<Product_Images> productImages = productImagesService.findAll();
        return ResponseEntity.ok(productImages);
    }

    @GetMapping("/productImages/{id}")
    public ResponseEntity<Product_Images> getProductImage(@PathVariable("id") Integer id) {
        Product_Images productImage = productImagesService.findById(id);
        return productImage != null
                ? ResponseEntity.ok(productImage)
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/productImages/images/{imageId}")
    public ResponseEntity<?> deleteProductImage(@PathVariable("imageId") Integer imageId) {
        try {
            productImagesService.delete(imageId);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Product Price Histories
    @GetMapping("/productPriceHistories")
    public ResponseEntity<List<ProductPriceHistories>> getAllProductPriceHistories() {
        List<ProductPriceHistories> productPriceHistoriesList = productPriceHistoriesService.findAll();
        return ResponseEntity.ok(productPriceHistoriesList);
    }
}
