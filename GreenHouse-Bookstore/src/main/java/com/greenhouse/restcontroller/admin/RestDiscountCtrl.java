package com.greenhouse.restcontroller.admin;

import com.greenhouse.model.Discounts;
import com.greenhouse.service.DiscountsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(value = "/rest/discounts")
public class RestDiscountCtrl {

    @Autowired
    private DiscountsService discountsService;

    @GetMapping
    public ResponseEntity<List<Discounts>> getAllDiscounts() {
        List<Discounts> discounts = discountsService.findAll();

        return new ResponseEntity<>(discounts, HttpStatus.OK);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<Discounts> getOne(@PathVariable("id") int id) {
        Discounts discount = discountsService.findById(id);
        if (discount == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(discount, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody Discounts discount) {
        Discounts existingDiscount = discountsService.findById(discount.getDiscountId());
        if (existingDiscount != null) {
            return new ResponseEntity<>("Mã giảm giá đã tồn tại.", HttpStatus.BAD_REQUEST);
        }

        Discounts createdDiscount = discountsService.add(discount);
        return new ResponseEntity<>(createdDiscount, HttpStatus.OK);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Discounts> update(@PathVariable("id") int id, @RequestBody Discounts discount) {
        Discounts existingDiscount = discountsService.findById(id);
        if (existingDiscount == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        discount.setDiscountId(id);
        discountsService.update(discount);
        return new ResponseEntity<>(discount, HttpStatus.OK);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") int id) {
        Discounts existingDiscount = discountsService.findById(id);
        if (existingDiscount == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        discountsService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @PostMapping(value = "/import")
    public ResponseEntity<Object> importDiscounts(@RequestParam("file") MultipartFile file) {
        try {
            // Gọi phương thức service để xử lý việc nhập danh sách từ file Excel
            List<Discounts> importedDiscounts = discountsService.importDiscounts(file);

            return new ResponseEntity<>(importedDiscounts, HttpStatus.OK);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Lỗi khi đọc file Excel", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
