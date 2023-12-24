package com.greenhouse.repository;

import java.sql.Time;
import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.greenhouse.model.Flash_Sales;

public interface FlashSalesRepository extends JpaRepository<Flash_Sales, Integer> {
        // Các phương thức truy vấn tùy chỉnh có thể được thêm vào đây nếu cần.
        @Query(value = "SELECT FS.Name, FS.Start_Date, FS.End_Date, FS.User_Date, PFS.Discount_Percentage, " +
                        "   PFS.Quantity, PFS.Used_Quantity, FS.Status " +
                        " FROM Product_Flash_Sale AS PFS INNER JOIN Flash_Sales AS FS " +
                        "ON PFS.Flash_Sale_Id = FS.Flash_Sale_Id", nativeQuery = true)
        List<Object[]> findAllFlashSale();

        @Query(value = "SELECT d.Product_Detail_Id, p.Product_Name, d.Quantity_In_Stock, d.Image ,d.Price " +
                        "FROM Products p JOIN Product_Detail d " +
                        "ON p.Product_Id = d.Product_Id " +
                        "WHERE p.Status = 1", nativeQuery = true)
        List<Object[]> findProductsByStatus();

        Flash_Sales findByStatus(int i);

        @Query(value = "select * from Flash_Sales where Status = 1", nativeQuery = true)
        List<Flash_Sales> findFlashSalesComingSoon();

}
