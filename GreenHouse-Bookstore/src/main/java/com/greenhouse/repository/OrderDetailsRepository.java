package com.greenhouse.repository;

import com.greenhouse.model.OrderDetails;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderDetailsRepository extends JpaRepository<OrderDetails, Integer> {
    List<OrderDetails> findByOrderCode(String orderCode);
}
