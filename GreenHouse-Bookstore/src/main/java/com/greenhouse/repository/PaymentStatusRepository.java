package com.greenhouse.repository;

import com.greenhouse.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentStatusRepository extends JpaRepository<PaymentStatus, Integer> {
    // Các phương thức truy vấn tùy chỉnh (nếu cần) có thể được thêm vào đây.
}
