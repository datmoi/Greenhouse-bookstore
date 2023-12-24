package com.greenhouse.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.greenhouse.model.Order_Status_History;

@Repository
public interface OrderStatusHistoryRepository extends JpaRepository<Order_Status_History, Integer> {
    // You can add custom query methods here if needed
}
