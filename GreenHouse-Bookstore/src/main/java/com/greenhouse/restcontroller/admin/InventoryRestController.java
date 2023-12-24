package com.greenhouse.restcontroller.admin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.dto.ImportInvoiceDTO;
import com.greenhouse.model.ImportInvoice;
import com.greenhouse.model.ImportInvoiceDetail;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Suppliers;
import com.greenhouse.repository.ImportInvoiceDetailRepository;
import com.greenhouse.repository.ImportInvoiceRepository;
import com.greenhouse.repository.ProductDetailRepository;
import com.greenhouse.repository.SuppliersRepository;

import jakarta.transaction.Transactional;

@RestController
@CrossOrigin("*")
public class InventoryRestController {

    @Autowired
    ProductDetailRepository productDetailRepository;

    @Autowired
    SuppliersRepository suppliersRepository;

    @Autowired
    ImportInvoiceRepository impInvoice_Repository;

    @Autowired
    ImportInvoiceDetailRepository impInvoiceDetailRepository;

    @GetMapping("/rest/getInventory")
    public ResponseEntity<Map<String, Object>> getInventory() {
        Map<String, Object> resp = new HashMap<>();
        List<ImportInvoice> importInvoice = impInvoice_Repository.findAll();
        List<ImportInvoiceDetail> importInvoiceDetails = impInvoiceDetailRepository.findAll();
        List<Product_Detail> productDetails = productDetailRepository.findAll();
        List<Suppliers> suppliers = suppliersRepository.findAll();

        resp.put("listImportInvoice", importInvoice);
        resp.put("importInvoiceDetails", importInvoiceDetails);
        resp.put("listProductDetails", productDetails);
        resp.put("suppliers", suppliers);
        return ResponseEntity.ok(resp);
    }

    @Transactional
    @GetMapping("/rest/importInvoiceEdit/{id}")
    public ResponseEntity<Map<String, Object>> editInvEntity(@PathVariable Integer id) {
        Map<String, Object> resp = new HashMap<>();
        List<ImportInvoiceDetail> listImportInvoiceDetails = impInvoiceDetailRepository
                .findAll();
        ImportInvoice importInvoices = impInvoice_Repository.findById(id).orElse(null);

        if (importInvoices == null) {
            return ResponseEntity.ok(null);
        }

        List<ImportInvoiceDetail> list = new ArrayList<>();
        for (ImportInvoiceDetail item : listImportInvoiceDetails) {
            if (item.getImportInvoice().getImportInvoiceId() == importInvoices.getImportInvoiceId()) {
                list.add(item);
            }
        }

        resp.put("selectedProducts", list);
        resp.put("importInvoice", importInvoices);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/rest/importInvoice")
    public ResponseEntity<String> postMethodName(@RequestBody ImportInvoiceDTO request) {
        ImportInvoice importInvoice = request.getImportInvoice();
        List<ImportInvoiceDetail> listImportInvoiceDetails = request.getImportInvoiceDetails();
        List<ImportInvoiceDetail> deletedImportInvoiceDetails = request.getDeletedImportInvoiceDetails().orElse(null);

        impInvoice_Repository.save(importInvoice);

        if (deletedImportInvoiceDetails.isEmpty()) {
            System.out.println("Không có sản phẩm bị xóa");
        } else {
            for (ImportInvoiceDetail item : deletedImportInvoiceDetails) {
                impInvoiceDetailRepository.delete(item);
            }
        }

        for (ImportInvoiceDetail importInvoiceDetail : listImportInvoiceDetails) {
            importInvoiceDetail.setImportInvoice(importInvoice);
            impInvoiceDetailRepository.save(importInvoiceDetail);

            Product_Detail productDetail = importInvoiceDetail.getProductDetail();

            // Cập nhật số lượng tồn kho của Product_Detail
            if (importInvoice.isStatus()) {
                // Nếu status của ImportInvoice là true, thì cập nhật số lượng tồn kho của Product_Detail
                int currentQuantityInStock = productDetail.getQuantityInStock();
                int quantityToAdd = importInvoiceDetail.getQuantity();
                int newQuantityInStock = currentQuantityInStock + quantityToAdd;
                productDetail.setQuantityInStock(newQuantityInStock);
    
                // Lưu lại thông tin Product_Detail sau khi cập nhật
                productDetailRepository.save(productDetail);
            }
        }

        return ResponseEntity.ok(null);
    }

}
