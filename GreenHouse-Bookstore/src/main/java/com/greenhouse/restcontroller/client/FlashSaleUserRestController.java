package com.greenhouse.restcontroller.client;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.model.Flash_Sales;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Product_Flash_Sale;
import com.greenhouse.repository.ProductDetailRepository;
import com.greenhouse.service.FlashSalesService;
import com.greenhouse.service.ProductFlashSaleService;

@CrossOrigin("*")
@RestController
@RequestMapping("/customer/rest")
public class FlashSaleUserRestController {

    @Autowired
    private ProductFlashSaleService productFlashSaleService;
    @Autowired
    private FlashSalesService flashSalesService;
    @Autowired
    private ProductDetailRepository productDetailRepository;

    @GetMapping("/productFlashSales")
    public ResponseEntity<List<Product_Flash_Sale>> getAllProductFlashSales() {
        List<Product_Flash_Sale> productFlashSales = productFlashSaleService.findAll();
        return ResponseEntity.ok(productFlashSales);

    }

    @GetMapping("/flashSales")
    public ResponseEntity<List<Flash_Sales>> getAllFlashSales() {
        List<Flash_Sales> flashSales = flashSalesService.findAll();
        return ResponseEntity.ok(flashSales);

    }
    @GetMapping("/getProductDetail")
    public ResponseEntity<List<Product_Detail>> getAllProducts() {
        List<Product_Detail> productDetails = productDetailRepository.findAll();
        return ResponseEntity.ok(productDetails);

    }

}
