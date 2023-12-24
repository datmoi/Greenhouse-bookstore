package com.greenhouse.service;

import com.cloudinary.provisioning.Account;
import com.greenhouse.model.Accounts;
import java.util.List;

public interface AccountsService {

    List<Accounts> findAll();

    Accounts findById(String username);

    Accounts add(Accounts entity);

    Accounts update(Accounts entity);

    void delete(String username);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    boolean existsById(String username);

    int countOrdersWithStatus();

    int countByCustomer();

    int countByBrand();

    List<Accounts> findByDeletedByIsNullAndDeletedAtIsNull();

}
