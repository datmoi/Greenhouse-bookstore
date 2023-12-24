package com.greenhouse.repository;

import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Products;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ProductsRepository extends JpaRepository<Products, String> {
    // Các phương thức truy vấn tùy chỉnh nếu cần
}
