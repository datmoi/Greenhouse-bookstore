package com.greenhouse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.greenhouse.model.ImportInvoice;

@Repository
public interface ImportInvoiceRepository extends JpaRepository<ImportInvoice, Integer> {
    // Các phương thức truy vấn tùy chỉnh có thể được thêm vào đây nếu cần.
}
