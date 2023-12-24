package com.greenhouse.dto;

import java.util.List;

import com.greenhouse.model.Categories;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.VoucherMappingCategory;
import com.greenhouse.model.VoucherMappingProduct;
import com.greenhouse.model.Vouchers;

import lombok.Data;

@Data
public class VoucherCateCreateDTO {
    private Vouchers voucher;
    private List<VoucherMappingCategory> categories;
    private List<Categories> listdeletedCategories;

    private List<VoucherMappingProduct> productDetails;
    private List<Product_Detail> listDeletedProducts;

}
