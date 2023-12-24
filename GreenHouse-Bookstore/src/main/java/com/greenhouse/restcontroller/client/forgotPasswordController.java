package com.greenhouse.restcontroller.client;

import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.dto.ChangePasswordDTO;
import com.greenhouse.dto.Response;
import com.greenhouse.model.Accounts;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.service.EmailService;
import com.greenhouse.service.TwilioOTPService;
import com.greenhouse.util.JwtTokenEmail;

@RestController
@RequestMapping("/customer/rest/forgot-password")
public class forgotPasswordController {
    @Autowired
    AccountRepository accountRepository;

    @Autowired
    JwtTokenEmail jwtTokenEmail;

    @Autowired
    EmailService sendEmail;

    @Autowired
    TwilioOTPService twilioOTPService;

    @PostMapping()
    public ResponseEntity<Response> sendConfirmationCode(@RequestBody ChangePasswordDTO dto) {
        Response response = new Response();
        String subject = "GreenHouse | Thay đổi mật khẩu";
        Accounts account = accountRepository.findByEmailOrPhone(dto.getEmail(), dto.getEmail());
        if (dto.getEmail().isEmpty()) {
            response.setStatus(400);
            response.setMessage("Thông tin không được bỏ trống!.");
            return ResponseEntity.status(response.getStatus()).body(response);
        }

        if (account == null) {
            response.setStatus(400);
            response.setMessage("Tài khoản không tồn tại!.");
            return ResponseEntity.status(response.getStatus()).body(response);
        }
        try {
            if (isPhoneNumber(dto.getEmail())) {
                twilioOTPService.sendOTPForgotPassword(dto.getEmail(), createAndSendToken(dto.getEmail()));
                response.setStatus(200);
                response.setMessage("Chúng tôi đã gửi một liên kết đổi mật khẩu đến số điện thoại của bạn.");
            } else if (isEmail(dto.getEmail())) {
                sendEmail.sendEmailFogotPassword(account.getEmail(), subject, createAndSendToken(account.getEmail()));
                response.setStatus(200);
                response.setMessage("Chúng tôi đã gửi một liên kết đổi mật khẩu đến email của bạn.");
            } else {

            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return ResponseEntity.status(response.getStatus()).body(response);
    }

    public String createAndSendToken(String email) {
        String token = jwtTokenEmail.generateToken(email);
        return token;
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
