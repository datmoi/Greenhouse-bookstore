package com.greenhouse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.greenhouse.model.Authors;

public interface AuthorsRepository extends JpaRepository<Authors, String> {
    // Các phương thức truy vấn tùy chỉnh nếu cần
}
