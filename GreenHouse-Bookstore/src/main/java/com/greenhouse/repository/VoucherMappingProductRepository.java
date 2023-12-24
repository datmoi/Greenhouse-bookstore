package com.greenhouse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.greenhouse.model.VoucherMappingProduct;

public interface VoucherMappingProductRepository extends JpaRepository<VoucherMappingProduct, Integer> {

    List<VoucherMappingProduct> findByVoucherId(int voucherId);

    List<VoucherMappingProduct> findByProductDetailId(int productDetailId);

    VoucherMappingProduct findByVoucherIdAndProductDetailId(int voucherId, int productDetailId);

    List<VoucherMappingProduct> findByVoucherId(Integer voucherId);

}
