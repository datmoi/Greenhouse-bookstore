package com.greenhouse.repository;

import com.greenhouse.model.Roles;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RolesRepository extends JpaRepository<Roles, Integer> {
    // Các phương thức truy vấn tùy chỉnh nếu cần
}
