package com.greenhouse.restcontroller.admin;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.greenhouse.dto.VoucherCateCreateDTO;
import com.greenhouse.model.Categories;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.VoucherMappingCategory;
import com.greenhouse.model.VoucherMappingProduct;
import com.greenhouse.model.Vouchers;
import com.greenhouse.repository.CategoriesRepository;
import com.greenhouse.repository.ProductDetailRepository;
import com.greenhouse.repository.VoucherMappingCategoryRepository;
import com.greenhouse.repository.VoucherMappingProductRepository;
import com.greenhouse.repository.VouchersRepository;

@RestController
@RequestMapping("/rest/vouchers")
public class VouchersRestController {

    @Autowired
    private VouchersRepository vouchersRepository;
    @Autowired
    private VoucherMappingCategoryRepository voucherMappingCategoryRepository;
    @Autowired
    private CategoriesRepository categoriesRepository;
    @Autowired
    private VoucherMappingProductRepository voucherMappingProductRepository;
    @Autowired
    private ProductDetailRepository productDetailRepository;

    @GetMapping
    public ResponseEntity<List<Vouchers>> getAllVouchers() {
        List<Vouchers> vouchers = vouchersRepository.findAll();
        return new ResponseEntity<>(vouchers, HttpStatus.OK);
    }

    @GetMapping("/{voucherId}")
    public ResponseEntity<Map<String, Object>> getVouchersById(@PathVariable("voucherId") int voucherId) {
        Map<String, Object> resp = new HashMap<>();

        Vouchers vouchers = vouchersRepository.findById(voucherId).orElse(null);
        List<Categories> categories = new ArrayList<>();
        List<Product_Detail> productDetails = new ArrayList<>();
        List<VoucherMappingCategory> listVoucherMappingCategories = voucherMappingCategoryRepository.findByVoucherId(voucherId);
        List<VoucherMappingProduct> listVoucherMappingProducts = voucherMappingProductRepository.findByVoucherId(voucherId);

        for (VoucherMappingCategory item : listVoucherMappingCategories) {
            Categories cate = categoriesRepository.findById(item.getCategoryId()).orElse(null);
            if (cate != null) {
                categories.add(cate);
            }
        }

        // Lấy danh sách product details
        for (VoucherMappingProduct item : listVoucherMappingProducts) {
            Product_Detail productDetail = productDetailRepository.findById(item.getProductDetailId()).orElse(null);
            if (productDetail != null) {
                productDetails.add(productDetail);
            }
        }

        resp.put("vouchers", vouchers);
        resp.put("categories", categories);
        resp.put("productDetails", productDetails); // Thêm danh sách product details vào resp

        return ResponseEntity.ok(resp);
    }


    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@RequestBody VoucherCateCreateDTO data) {

        Map<String, Object> resp = new HashMap<>();
        String message = "";

        Vouchers vouchers = data.getVoucher();
        List<VoucherMappingCategory> categories = data.getCategories();
        List<Categories> listdeletedCategories = data.getListdeletedCategories();
        List<VoucherMappingProduct> products = data.getProductDetails();
        List<Product_Detail> listdeletedProducts = data.getListDeletedProducts();

        if (listdeletedCategories != null) {
            for (Categories item : listdeletedCategories) {
                VoucherMappingCategory vmc = voucherMappingCategoryRepository
                        .findByVoucherIdAndCategoryId(vouchers.getVoucherId(), item.getCategoryId());
                voucherMappingCategoryRepository.delete(vmc);
            }
        }

        if (listdeletedProducts != null) {
            for (Product_Detail item : listdeletedProducts) {
                VoucherMappingProduct vmp = voucherMappingProductRepository.
                        findByVoucherIdAndProductDetailId(vouchers.getVoucherId(), item.getProductDetailId());
                voucherMappingProductRepository.delete(vmp);
            }
        }

        vouchersRepository.save(vouchers);

        List<VoucherMappingCategory> voucherMappingCategories = voucherMappingCategoryRepository
                .findByVoucherId(vouchers.getVoucherId());

        boolean isEditing = false;
        for (VoucherMappingCategory c : categories) {
            boolean duplicate = voucherMappingCategories.stream()
                    .anyMatch(vc -> vc.getCategoryId().equals(c.getCategoryId()));
            if (!duplicate) {
                isEditing = true;

                VoucherMappingCategory item = new VoucherMappingCategory();
                item.setVoucherId(vouchers.getVoucherId());
                item.setCategoryId(c.getCategoryId());

                voucherMappingCategoryRepository.save(item);
            }
        }

        List<VoucherMappingProduct> voucherMappingProducts = voucherMappingProductRepository
                .findByVoucherId(vouchers.getVoucherId());

        boolean isEditingProduct = false;
        for (VoucherMappingProduct p : products) {
            boolean duplicate = voucherMappingProducts.stream()
                    .anyMatch(vp -> vp.getProductDetailId() == p.getProductDetailId());
            if (!duplicate) {
                isEditingProduct = true;

                VoucherMappingProduct item = new VoucherMappingProduct();
                item.setVoucherId(vouchers.getVoucherId());
                item.setProductDetailId(p.getProductDetailId());

                voucherMappingProductRepository.save(item);
            }
        }

        message = isEditing || isEditingProduct ? "Cập nhật voucher thành công" : "Thêm voucher thành công";
        resp.put("message", message);

        return ResponseEntity.ok(resp);
    }


    @DeleteMapping(value = "/{voucherId}")
    public ResponseEntity<Void> delete(@PathVariable("voucherId") int voucherId) {
        List<VoucherMappingCategory> voucherMappingCategories = voucherMappingCategoryRepository
                .findByVoucherId(voucherId);

        for (VoucherMappingCategory v : voucherMappingCategories) {
            voucherMappingCategoryRepository.delete(v);
        }

        List<VoucherMappingProduct> voucherMappingProducts = voucherMappingProductRepository
                .findByVoucherId(voucherId);

        for (VoucherMappingProduct v : voucherMappingProducts) {
            voucherMappingProductRepository.delete(v);
        }

        Vouchers existingVouchers = vouchersRepository.findById(voucherId).orElse(null);
        if (existingVouchers == null) {
            return ResponseEntity.notFound().build();
        }
        vouchersRepository.delete(existingVouchers);
        return ResponseEntity.ok().build();
    }
    

}
