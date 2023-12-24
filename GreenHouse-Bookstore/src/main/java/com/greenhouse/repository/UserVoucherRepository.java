package com.greenhouse.repository;

import java.util.List;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.greenhouse.model.UserVoucher;
import com.greenhouse.model.Vouchers;

@Repository
public interface UserVoucherRepository extends JpaRepository<UserVoucher, Integer> {

    // List<UserVoucher> findByUsername(String username);

    List<UserVoucher> findByUsernameAndStatus(String username, Boolean status);

    List<Optional<UserVoucher>> findByUsername(String username);

    UserVoucher findByUsernameAndVoucher(String username, Vouchers vouchers);

    UserVoucher findByUsernameAndVoucherAndStatus(String username, Vouchers vouchers, boolean b);
}
