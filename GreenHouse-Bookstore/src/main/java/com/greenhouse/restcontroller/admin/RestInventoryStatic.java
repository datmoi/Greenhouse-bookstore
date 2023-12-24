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
import com.greenhouse.service.FlashSalesService;
import com.greenhouse.service.ProductDetailService;

@RestController
@CrossOrigin("*")
public class RestInventoryStatic {

    @Autowired
    ProductDetailRepository pd;

    @GetMapping("/rest/inventory-static")
    public ResponseEntity<Map<String, List<Object[]>>> getAll() {
        Map<String, List<Object[]>> resp = new HashMap<>();
        List<Object[]> list1 = pd.findAllInventoryList();
        List<Object[]> list2 = pd.findAllInventoryListAsc();
        resp.put("list1", list1);
        resp.put("list2", list2);
        return ResponseEntity.ok(resp);
    }
}