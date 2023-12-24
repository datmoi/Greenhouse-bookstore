package com.greenhouse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.greenhouse.model.Invoices;

@Repository
public interface InvoicesRepository extends JpaRepository<Invoices, Integer> {

    @Query(value = "SELECT SUM(Total_Amount) AS TotalRevenue " +
            "FROM Invoices " +
            "WHERE YEAR(Payment_Date) = YEAR(GETDATE())", nativeQuery = true)
    Double calculateTotalRevenueForCurrentYear();

    @Query(value = "SELECT SUM(Total_Amount) AS TotalRevenue " +
            "FROM Invoices " +
            "WHERE YEAR(Payment_Date) = YEAR(DATEADD(year, -1, GETDATE()))", nativeQuery = true)
    Double calculateTotalRevenueForLastYear();

    @Query(value = "SELECT SUM(Total_Amount) AS TotalRevenue " +
            "FROM Invoices " +
            "WHERE YEAR(Payment_Date) = YEAR(GETDATE()) " +
            "AND MONTH(Payment_Date) = MONTH(GETDATE())", nativeQuery = true)
    Double calculateTotalRevenueForCurrentMonth();

    @Query(value = "SELECT YEAR(Payment_Date) AS Year FROM Invoices GROUP BY YEAR(Payment_Date) ORDER BY Year", nativeQuery = true)
    List<Object[]> yearsWithRevenue();

}
