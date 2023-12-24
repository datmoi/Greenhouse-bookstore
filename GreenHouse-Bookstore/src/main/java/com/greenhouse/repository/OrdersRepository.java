package com.greenhouse.repository;

import com.greenhouse.model.Invoices;
import com.greenhouse.model.Orders;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrdersRepository extends JpaRepository<Orders, String> {
    List<Orders> findByUsername(String username);

    Orders findByOrderCode(String orderCode);

    Orders findByInvoices(Invoices invoices);
}
