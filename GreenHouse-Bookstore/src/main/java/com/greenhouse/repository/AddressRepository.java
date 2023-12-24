package com.greenhouse.repository;

import com.greenhouse.model.Address;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {
    // Các phương thức tùy chỉnh có thể được thêm vào đây nếu cần
    List<Optional<Address>> findByUsername(String username);
}

