package com.greenhouse.service.impl;

import com.greenhouse.model.Accounts;
import com.greenhouse.model.Authorities;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.service.AccountsService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class AccountsServiceImpl implements AccountsService {

    @Autowired
    AccountRepository accountsRepository;
    Authorities authorities = new Authorities();

    @Override
    public List<Accounts> findAll() {
        return accountsRepository.findAll();
    }

    @Override
    public Accounts findById(String username) {
        Optional<Accounts> result = accountsRepository.findById(username);
        return result.orElse(null);
    }

    @Override
    public Accounts add(Accounts accounts) {
        // Thực hiện mã hóa mật khẩu trước khi lưu vào cơ sở dữ liệu
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        accounts.setPassword(passwordEncoder.encode(accounts.getPassword()));
        return accountsRepository.save(accounts);
    }

    @Override
    public Accounts update(Accounts accounts) {
        return accountsRepository.save(accounts);
    }

    @Override
    public void delete(String username) {
        accountsRepository.deleteById(username);
    }

    @Override
    public int countOrdersWithStatus() {
        return accountsRepository.countOrdersWithStatus();
    }

    @Override
    public int countByCustomer() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'countByCustomer'");
    }

    @Override
    public int countByBrand() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'countByBrand'");
    }

    @Override
    public boolean existsByEmail(String email) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'existsByEmail'");
    }

    @Override
    public boolean existsByPhone(String phone) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'existsByPhone'");
    }

    @Override
    public boolean existsById(String username) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'existsById'");
    }

    @Override
    public List<Accounts> findByDeletedByIsNullAndDeletedAtIsNull() {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findByDeletedByIsNullAndDeletedAtIsNull'");
    }


}
