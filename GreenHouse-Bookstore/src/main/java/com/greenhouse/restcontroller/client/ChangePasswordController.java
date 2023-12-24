package com.greenhouse.restcontroller.client;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.dto.ChangePasswordDTO;
import com.greenhouse.dto.Response;
import com.greenhouse.model.Accounts;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.service.EmailService;
import com.greenhouse.util.JwtTokenEmail;

import io.jsonwebtoken.ExpiredJwtException;

@RestController
@RequestMapping("/customer/rest/reset-password")
public class ChangePasswordController {
    @Autowired
    AccountRepository accountRepository;

    @Autowired
    JwtTokenEmail jwtTokenEmail;

    @Autowired
    EmailService sendEmail;

    @PostMapping()
    private ResponseEntity<Response> resetPassword(@RequestBody ChangePasswordDTO dto) {
        Response response = new Response();
        if (dto.getNewPassword().isEmpty() || dto.getConfirmPassword().isEmpty()) {
            response.setStatus(400);
            response.setMessage("Không được bỏ trống thông tin!");
            return ResponseEntity.status(response.getStatus()).body(response);
        }
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            response.setStatus(400);
            response.setMessage("Mật khẩu không trùng khớp!");
            return ResponseEntity.status(response.getStatus()).body(response);
        }

        if (!isValidPassword(dto.getNewPassword())) {
            response.setStatus(400);
            response.setMessage("Mật khẩu không hợp lệ!");
            return ResponseEntity.status(response.getStatus()).body(response);
        }

        try {
            if (!jwtTokenEmail.isTokenExpired(dto.getToken())) {
                Accounts accounts = accountRepository.findByEmailOrPhone(jwtTokenEmail.getEmailFromToken(dto.getToken()), jwtTokenEmail.getEmailFromToken(dto.getToken()));
                accounts.setPassword(new BCryptPasswordEncoder().encode(dto.getNewPassword()));
                accountRepository.save(accounts);
                response.setStatus(200);
                response.setMessage("Đổi mật khẩu thành công!");
                return ResponseEntity.status(response.getStatus()).body(response);
            }
        } catch (ExpiredJwtException e) {
            response.setStatus(400);
            response.setMessage(
                    "Xin lỗi, thao tác đổi mật khẩu đã hết hạn. Vui lòng thực hiện lại yêu cầu đổi mật khẩu bằng cách gửi mã xác nhận mới. Chúng tôi rất xin lỗi vì sự bất tiện này và sẽ cố gắng để cung cấp dịch vụ tốt nhất cho bạn.");
            return ResponseEntity.status(response.getStatus()).body(response);
        } catch (IllegalArgumentException e) {
            response.setStatus(400);
            response.setMessage(
                    "Xin lỗi, thao tác đổi mật khẩu đã hết hạn. Vui lòng thực hiện lại yêu cầu đổi mật khẩu bằng cách gửi mã xác nhận mới. Chúng tôi rất xin lỗi vì sự bất tiện này và sẽ cố gắng để cung cấp dịch vụ tốt nhất cho bạn.");
            return ResponseEntity.status(response.getStatus()).body(response);
        }
        response.setStatus(400);
        response.setMessage("Đổi mật khẩu thất bại.");
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    @PostMapping("/{username}")
    private ResponseEntity<Response> resetPasswordByUsername(@RequestBody ChangePasswordDTO dto,
                                                             @PathVariable String username) {
        Response response = new Response();
        if (dto.getNewPassword().isEmpty() || dto.getConfirmPassword().isEmpty()) {
            response.setStatus(400);
            response.setMessage("Không được bỏ trống thông tin!");
            return ResponseEntity.status(response.getStatus()).body(response);
        }
        if (!dto.getNewPassword().equals(dto.getConfirmPassword())) {
            response.setStatus(400);
            response.setMessage("Mật khẩu không trùng khớp!");
            return ResponseEntity.status(response.getStatus()).body(response);
        }

        if (!isValidPassword(dto.getNewPassword())) {
            response.setStatus(400);
            response.setMessage("Mật khẩu không hợp lệ!");
            return ResponseEntity.status(response.getStatus()).body(response);
        }

        Accounts accounts = accountRepository.findByUsername(username);
        accounts.setPassword(new BCryptPasswordEncoder().encode(dto.getNewPassword()));
        accountRepository.save(accounts);
        response.setStatus(200);
        response.setMessage("Đổi mật khẩu thành công!");
        return ResponseEntity.status(response.getStatus()).body(response);
    }

    private boolean isValidPassword(String password) {
        // Kiểm tra xem mật khẩu có ít nhất 8 ký tự
        if (password.length() < 8) {
            return false;
        }

        // Kiểm tra xem mật khẩu có ít nhất một chữ cái viết thường
        Pattern lowercasePattern = Pattern.compile(".*[a-z].*");
        Matcher lowercaseMatcher = lowercasePattern.matcher(password);
        if (!lowercaseMatcher.find()) {
            return false;
        }

        // Kiểm tra xem mật khẩu có ít nhất một chữ cái viết hoa
        Pattern uppercasePattern = Pattern.compile(".*[A-Z].*");
        Matcher uppercaseMatcher = uppercasePattern.matcher(password);
        if (!uppercaseMatcher.find()) {
            return false;
        }

        // Kiểm tra xem mật khẩu có ít nhất một số
        Pattern digitPattern = Pattern.compile(".*\\d.*");
        Matcher digitMatcher = digitPattern.matcher(password);
        if (!digitMatcher.find()) {
            return false;
        }

        // Kiểm tra xem mật khẩu có ít nhất một ký tự đặc biệt
        Pattern specialCharPattern = Pattern.compile(".*[@#$%^&+=!].*");
        Matcher specialCharMatcher = specialCharPattern.matcher(password);
        if (!specialCharMatcher.find()) {
            return false;
        }

        // Nếu mật khẩu thoả mãn tất cả các điều kiện trên, trả về true
        return true;
    }
}
