package com.greenhouse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.greenhouse.model.VoucherMappingCategory;

@Repository
public interface VoucherMappingCategoryRepository extends JpaRepository<VoucherMappingCategory, Integer> {

    List<VoucherMappingCategory> findByVoucherId(int voucherId);

    List<VoucherMappingCategory> findByCategoryId(String categoryId);

    VoucherMappingCategory findByVoucherIdAndCategoryId(int voucherId, String categoryId);

}
