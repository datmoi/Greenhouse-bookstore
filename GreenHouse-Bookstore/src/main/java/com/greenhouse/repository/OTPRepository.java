package com.greenhouse.repository;

import com.greenhouse.model.Accounts;
import com.greenhouse.model.OTP;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OTPRepository extends JpaRepository<OTP, Integer> {
    OTP findByUsernameAndOtpCode(Accounts username, String otpCode);

    OTP findByUsername(Accounts username);
}
