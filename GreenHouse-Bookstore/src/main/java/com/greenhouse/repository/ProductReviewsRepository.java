package com.greenhouse.repository;

import com.greenhouse.model.Product_Reviews;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductReviewsRepository extends JpaRepository<Product_Reviews, Integer> {
    // Bạn có thể thêm các phương thức truy vấn tùy chỉnh ở đây nếu cần.
    List<Product_Reviews> findByProductDetail_ProductDetailId(int productDetailId);

    List<Product_Reviews> findByAccountUsername(String username);

    Product_Reviews findByReviewId(int reviewId);

    List<Product_Reviews> findByOrder_OrderCode(String OrderCode);

    boolean existsByAccount_UsernameAndProductDetail_ProductDetailId(String username, Integer productDetailId);
    
    boolean existsByAccount_UsernameAndProductDetail_ProductDetailIdAndOrder_OrderCode(
        String username,
        Integer productDetailId,
        String orderCode
    );
}
