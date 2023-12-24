package com.greenhouse.restcontroller.admin;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.google.gson.Gson;
import com.greenhouse.model.Suppliers; // Import Suppliers thay vì Publishers
import com.greenhouse.service.SuppliersService; // Import SuppliersService thay vì PublishersService
import com.greenhouse.util.ImageUploader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(value = "/rest/suppliers") // Thay đổi đường dẫn
public class RestSuppliersController {

    @Autowired
    private SuppliersService suppliersService; // Sử dụng SuppliersService thay vì PublishersService


    @GetMapping
    public ResponseEntity<List<Suppliers>> getAllSuppliers() { // Thay đổi tên phương thức và kiểu dữ liệu
        List<Suppliers> suppliers = suppliersService.findAll(); // Sử dụng Suppliers thay vì Publishers
        return new ResponseEntity<>(suppliers, HttpStatus.OK);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<Suppliers> getOne(@PathVariable("id") String id) { // Thay đổi tên biến
        Suppliers supplier = suppliersService.findById(id); // Sử dụng Suppliers thay vì Publishers
        if (supplier == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(supplier, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestParam(value = "image", required = false) MultipartFile file,
                                         @RequestParam("supplierJson") String supplierJson) throws Exception {
        if (StringUtils.isEmpty(supplierJson)) {
            return new ResponseEntity<>("Thông tin nhà cung cấp không hợp lệ.", HttpStatus.BAD_REQUEST);
        }

        String photoUrl = null;
        if (file != null && !file.isEmpty()) {
            photoUrl = ImageUploader.uploadImage(file, "suppliers_" + System.currentTimeMillis());
   }


        // Xử lý thông tin nhà cung cấp
        Suppliers supplier = new Gson().fromJson(supplierJson, Suppliers.class);

        if (photoUrl != null) {
            supplier.setImage(photoUrl);
        }


        Suppliers existingSupplier = suppliersService.findById(supplier.getSupplierId());
        if (existingSupplier != null) {
            return new ResponseEntity<>("Nhà cung cấp đã tồn tại.", HttpStatus.BAD_REQUEST);
        }

        Suppliers createdSupplier = suppliersService.add(supplier);
        return new ResponseEntity<>(createdSupplier, HttpStatus.OK);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Suppliers> update(@PathVariable("id") String id,
                                            @RequestParam(value = "image", required = false) MultipartFile file,
                                            @RequestParam("supplierJson") String supplierJson) throws Exception {

        String photoUrl = null;
        if (file != null && !file.isEmpty()) {
            photoUrl = ImageUploader.uploadImage(file, "suppliers_" + System.currentTimeMillis());
        }


        // Xử lý thông tin nhà cung cấp
        Suppliers supplier = new Gson().fromJson(supplierJson, Suppliers.class);

        if (photoUrl != null) {
            supplier.setImage(photoUrl);
        }

        // Cập nhật thông tin nhà cung cấp
        supplier.setSupplierId(id);

        Suppliers updatedSupplier = suppliersService.update(supplier);
        return ResponseEntity.ok(updatedSupplier);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) { // Thay đổi tên biến
        Suppliers existingSupplier = suppliersService.findById(id); // Sử dụng Suppliers thay vì Publishers
        if (existingSupplier == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        suppliersService.delete(id); // Sử dụng Suppliers thay vì Publishers
        return new ResponseEntity<>(HttpStatus.OK);
    }



}
