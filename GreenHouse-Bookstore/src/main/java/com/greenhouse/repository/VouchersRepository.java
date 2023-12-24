package com.greenhouse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.greenhouse.model.Vouchers;

@Repository
public interface VouchersRepository extends JpaRepository<Vouchers, Integer> {
    @Query(value = "SELECT * FROM Vouchers WHERE Start_Date <= GETDATE() AND End_Date >= GETDATE() AND Status = 1", nativeQuery = true)
    List<Vouchers> findActiveVouchers();
}
