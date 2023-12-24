package com.greenhouse.repository;

import com.greenhouse.model.ProductAttributes;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductAttributesRepository extends JpaRepository<ProductAttributes, Integer> {
    // Bạn có thể thêm các phương thức truy vấn tùy chỉnh ở đây nếu cần.
}
