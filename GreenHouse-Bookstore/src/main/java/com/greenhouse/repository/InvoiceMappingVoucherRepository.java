package com.greenhouse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.greenhouse.model.InvoiceMappingVoucher;
import com.greenhouse.model.Invoices;

@Repository
public interface InvoiceMappingVoucherRepository extends JpaRepository<InvoiceMappingVoucher, Integer> {

    List<InvoiceMappingVoucher> findByInvoice(Invoices invoice);

}
