package com.greenhouse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.greenhouse.model.Accounts;

public interface AccountRepository extends JpaRepository<Accounts, String> {
        Accounts findByUsernameAndActiveIsTrue(String username);

        Accounts findByUsername(String username);

        Accounts findByEmail(String username);

        Accounts findByPhone(String username);

        Accounts findByUsernameAndEmail(String username, String email);

        Accounts findByEmailOrPhone(String username, String phone);

        Accounts findByUsernameOrEmailOrPhone(String username, String email, String phone);

        boolean existsByUsernameAndActiveIsTrue(String username);

        boolean existsByEmailAndActiveIsTrue(String email);

        boolean existsByPhoneAndActiveIsTrue(String phone);

        boolean existsByPhone(String phone);

        boolean existsByEmail(String email);

        @Query(value = "SELECT COUNT(o.Order_Code) FROM Orders o ", nativeQuery = true)
        int countOrdersWithStatus();

        @Query(value = "SELECT  COUNT(*) AS UsersCount " +
                        "FROM Accounts " +
                        "WHERE YEAR(Create_At) = YEAR(GETDATE()) AND Active = 1 " +
                        "GROUP BY YEAR(Create_At)", nativeQuery = true)
        long countActiveUsersByYear();

    @Query(value = "SELECT COUNT(*) AS UsersCount " +
            "FROM Accounts " +
            "WHERE YEAR(Create_At) = YEAR(GETDATE()) - 1 AND Active = 1", nativeQuery = true)
    Long countActiveUsersByPreviousYear();


    List<Accounts> findByDeletedByIsNullAndDeletedAtIsNull();

    List<Accounts> findAllByActiveTrue();

}
