package com.greenhouse.restcontroller.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.repository.ProductDetailRepository;

@RestController
@CrossOrigin("*")
public class RestStaticBestSeller {
    @Autowired
    ProductDetailRepository pd;

    @GetMapping("/rest/best-seller")
    public ResponseEntity<List<Object[]>> getBestSellers() {
        List<Object[]> bestSellers = pd.getBestSellingProducts();
        return ResponseEntity.ok(bestSellers);
    }
}
