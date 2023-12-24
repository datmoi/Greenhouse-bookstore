package com.greenhouse.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import com.greenhouse.model.Brands;

public interface BrandRepository extends JpaRepository<Brands, String> {
        @Query(value = "SELECT B.* FROM Brands B " +
                        "WHERE B.Brand_Id IN (" +
                        "  SELECT P.Brand_Id " +
                        "  FROM Products P " +
                        "  INNER JOIN Product_Detail PD ON P.Product_Id = PD.Product_Id " +
                        "  INNER JOIN Invoice_Details ID ON PD.Product_Detail_Id = ID.Product_Detail_Id " +
                        "  GROUP BY P.Brand_Id " +
                        "  HAVING COUNT(ID.Invoice_Detail_Id) > 0)", nativeQuery = true)
        List<Brands> findBrandsWithSales();

        Optional<Brands> findByBrandName(String brandName);

       
}
