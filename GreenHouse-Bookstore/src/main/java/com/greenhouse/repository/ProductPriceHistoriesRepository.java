package com.greenhouse.repository;

import com.greenhouse.model.ProductPriceHistories;
import com.greenhouse.model.Product_Detail;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductPriceHistoriesRepository extends JpaRepository<ProductPriceHistories, Integer> {
    // Các phương thức truy vấn tùy chỉnh nếu cần
    ProductPriceHistories findByProductDetail(Product_Detail productDetail);
}
