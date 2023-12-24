package com.greenhouse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.greenhouse.model.InvoiceDetails;
import com.greenhouse.model.Invoices;

@Repository
public interface InvoiceDetailsRepository extends JpaRepository<InvoiceDetails, Integer> {
    List<InvoiceDetails> findByInvoice(Invoices invoiceId);
}
