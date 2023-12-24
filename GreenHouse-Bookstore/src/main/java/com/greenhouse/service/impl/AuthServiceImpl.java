package com.greenhouse.service.impl;

import java.util.Date;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.greenhouse.dto.SignupDTO;
import com.greenhouse.dto.UserDTO;
import com.greenhouse.model.Accounts;
import com.greenhouse.model.Authorities;
import com.greenhouse.model.OTP;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.AuthoritiesRepository;
import com.greenhouse.repository.OTPRepository;
import com.greenhouse.service.AuthService;

@Service
public class AuthServiceImpl implements AuthService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AuthoritiesRepository authoritiesRepository;

    @Autowired
    private OTPRepository otpRepository;

    @Override
    public UserDTO signup(SignupDTO signupDTO) {
        Accounts accounts = new Accounts();
        Authorities authorities = new Authorities();
        UserDTO accountsDTO = new UserDTO();

        accounts.setUsername(signupDTO.getEmailAndPhone());
        accounts.setPassword(new BCryptPasswordEncoder().encode(signupDTO.getPassword()));
        accounts.setCreatedAt(new Date());
        accounts.setActive(true);
        if (isEmail(signupDTO.getEmailAndPhone())) {
            accounts.setEmail(signupDTO.getEmailAndPhone());
        } else if (isPhoneNumber(signupDTO.getEmailAndPhone())) {
            accounts.setPhone(signupDTO.getEmailAndPhone());
        }
        Accounts createdUser = accountRepository.save(accounts); // lưu vào db bảng account

        authorities.setUsername(accounts.getUsername());
        authorities.setRoleId(3);
        authoritiesRepository.save(authorities); // lưu vào db bảng authorities

        OTP otp = otpRepository.findByUsernameAndOtpCode(accounts, signupDTO.getCode());

        otp.setId(otp.getId());
        otp.setStatus(1);
        otpRepository.save(otp);

        accountsDTO.setUsername(createdUser.getUsername());
        accountsDTO.setEmail(createdUser.getEmail());
        accountsDTO.setFullname(createdUser.getFullname());
        return accountsDTO;
    }

    // Kiểm tra xem chuỗi có phải là một địa chỉ email hay không
    private boolean isEmail(String input) {
        // Biểu thức chính quy kiểm tra địa chỉ email đơn giản
        String emailPattern = "^[A-Za-z0-9+_.-]+@(.+)$";
        return Pattern.matches(emailPattern, input);
    }

    // Kiểm tra xem chuỗi có phải là số điện thoại hay không
    private boolean isPhoneNumber(String input) {
        // Biểu thức chính quy kiểm tra số điện thoại đơn giản
        String phonePattern = "^[0-9]{10}$";
        return Pattern.matches(phonePattern, input);
    }
}
