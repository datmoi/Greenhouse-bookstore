package com.greenhouse.repository;

import com.greenhouse.model.ImportInvoiceDetail;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ImportInvoiceDetailRepository extends JpaRepository<ImportInvoiceDetail, Integer> {
    // Các phương thức truy vấn tùy chỉnh có thể được thêm vào đây nếu cần.
}
