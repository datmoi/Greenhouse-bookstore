package com.greenhouse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.greenhouse.model.Carts;

public interface CartsRepository extends JpaRepository<Carts, Integer> {
    // Các phương thức truy vấn tùy chỉnh nếu cần
    @Query("SELECT c FROM Carts c WHERE c.account.username = ?1 AND c.productDetail.productDetailId = ?2 AND c.status = ?3")
    Carts findCartsByUsernameAndProductDetailIdAndStatus(String username, int productDetailId, boolean status);

    @Query("SELECT c FROM Carts c WHERE c.account.username = ?1 AND c.status = ?2")
    List<Carts> findByAccountIdAndStatusOrderByCreatedDateDesc(String username, boolean b);
}
