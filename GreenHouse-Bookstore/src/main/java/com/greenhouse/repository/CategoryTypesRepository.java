package com.greenhouse.repository;

import com.greenhouse.model.CategoryTypes;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface CategoryTypesRepository extends JpaRepository<CategoryTypes, String> {
    // Các phương thức truy vấn tùy chỉnh có thể được thêm vào đây nếu cần.
    @Query("SELECT DISTINCT c.parentCategoriesType FROM CategoryTypes c")
    List<String> findDistinctParentCategoriesType();
}
