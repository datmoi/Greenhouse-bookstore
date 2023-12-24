package com.greenhouse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.greenhouse.model.InvoiceMappingStatus;
import com.greenhouse.model.Invoices;

@Repository
public interface InvoiceMappingStatusRepository extends JpaRepository<InvoiceMappingStatus, Integer> {
    // Các phương thức truy vấn tùy chỉnh có thể được thêm vào đây nếu cần.
    InvoiceMappingStatus findTopByInvoiceOrderByUpdateAtDesc(Invoices invoices);
}
