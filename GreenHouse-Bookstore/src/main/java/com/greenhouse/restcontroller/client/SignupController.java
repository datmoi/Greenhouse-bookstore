package com.greenhouse.restcontroller.client;

import java.util.Calendar;
import java.util.Date;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.dto.Response;
import com.greenhouse.dto.SignupDTO;
import com.greenhouse.model.Accounts;
import com.greenhouse.model.OTP;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.OTPRepository;
import com.greenhouse.service.AuthService;
import com.greenhouse.service.EmailService;
import com.greenhouse.service.TwilioOTPService;
import com.twilio.exception.ApiException;

@RestController
@RequestMapping("/sign-up")
public class SignupController {

    @Autowired
    private AuthService authService;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private OTPRepository otpRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TwilioOTPService twilioOTPService;

    private static final String PASSWORD_PATTERN = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!])(?=\\S+$).{8,}$";

    private static final Pattern pattern = Pattern.compile(PASSWORD_PATTERN);

    @PostMapping("")
    public ResponseEntity<Response> signupUser(@RequestBody SignupDTO signupDTO) {
        Response response = new Response();
        Accounts findAccounts = accountRepository.findByUsername(signupDTO.getEmailAndPhone());
        OTP otp = otpRepository.findByUsername(findAccounts);

        if (isEmpty(signupDTO.getPassword()) || isEmpty(signupDTO.getRepassword())
                || isEmpty(signupDTO.getEmailAndPhone()) || isEmpty(signupDTO.getCode())) {
            response.setStatus(400);
            response.setMessage("Thông tin bắt buộc chưa được điền đầy đủ.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        if (otp != null) {
            Date currentTime = new Date();
            Date expiredTime = otp.getExpiredTime();
            long currentTimeInSeconds = currentTime.getTime() / 1000; // Chuyển đổi thành giây
            long expiredTimeInSeconds = expiredTime.getTime() / 1000; // Chuyển đổi thành giây

            if (!otp.getOtpCode().equals(signupDTO.getCode())) {
                response.setStatus(400);
                response.setMessage("Mã xác nhận không chính xác.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            if (currentTimeInSeconds > expiredTimeInSeconds) {
                response.setStatus(400);
                response.setMessage("Mã xác nhận đã hết thời gian.");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
        } else {
            response.setStatus(400);
            response.setMessage("Vui lòng nhập đúng Email hoặc số điện thoại đã gửi mã OTP.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        // So sánh mật khẩu và xác nhận mật khẩu
        if (!signupDTO.getPassword().equals(signupDTO.getRepassword())) {
            response.setStatus(400);
            response.setMessage("Mật khẩu không trùng khớp!");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } else if (!validatePassword(signupDTO.getPassword())) {
            response.setStatus(400);
            response.setMessage("Mật khẩu không hợp lệ.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
        // Đăng ký tài khoản
        authService.signup(signupDTO);
        response.setStatus(201);
        response.setMessage("Đăng ký tài khoản thành công!");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/send-code")
    private ResponseEntity<Response> sendCode(@RequestBody SignupDTO signupDTO) {
        Response response = new Response();
        String code = generateRandomCode();

        if (isEmpty(signupDTO.getEmailAndPhone())) {
            response.setStatus(400);
            response.setMessage("Email hoặc số điện thoại không được bỏ trống.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
        // Kiểm tra tên đăng nhập và email đã tồn tại
        if (accountRepository.existsByEmailAndActiveIsTrue(signupDTO.getEmailAndPhone())) {
            response.setStatus(400);
            response.setMessage("Email đã tồn tại.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        if (accountRepository.existsByPhoneAndActiveIsTrue(signupDTO.getEmailAndPhone())) {
            response.setStatus(400);
            response.setMessage("Số điện thoại đã tồn tại.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        if (isEmpty(signupDTO.getEmailAndPhone())) {
            response.setStatus(400);
            response.setMessage("Thông tin không được để trống.");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        if (isPhoneNumber(signupDTO.getEmailAndPhone())) {
            Accounts newAccounts = new Accounts();
            newAccounts.setUsername(signupDTO.getEmailAndPhone());
            newAccounts.setPhone(signupDTO.getEmailAndPhone());
            newAccounts.setCreatedAt(new Date());
            newAccounts.setActive(false);
            accountRepository.save(newAccounts);
            /////////////////////////////////////////
            OTP otp = otpRepository.findByUsername(newAccounts);
            if (otp != null) {
                Calendar cal = Calendar.getInstance();
                cal.setTime(new Date()); // Sử dụng thời gian hiện tại
                cal.add(Calendar.MINUTE, 3); // Thêm 3 phút
                OTP createOTP = new OTP();
                createOTP.setId(otp.getId());
                createOTP.setUsername(newAccounts);
                createOTP.setOtpCode(code);
                createOTP.setCreateTime(new Date());
                createOTP.setExpiredTime(cal.getTime());
                createOTP.setStatus(0);
                otpRepository.save(createOTP);
                try {
                    twilioOTPService.sendOTP(signupDTO.getEmailAndPhone(), code);
                } catch (ApiException apiException) {
                    response.setStatus(400);
                    response.setMessage("Số điện thoại không hổ trợ.");
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
                response.setStatus(201);
                response.setMessage("OTP đã được gửi.");
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            } else {
                Calendar cal = Calendar.getInstance();
                cal.setTime(new Date()); // Sử dụng thời gian hiện tại
                cal.add(Calendar.MINUTE, 3); // Thêm 3 phút
                OTP createOTP = new OTP();
                createOTP.setUsername(newAccounts);
                createOTP.setOtpCode(code);
                createOTP.setCreateTime(new Date());
                createOTP.setExpiredTime(cal.getTime());
                createOTP.setStatus(0);
                otpRepository.save(createOTP);
                try {
                    twilioOTPService.sendOTP(signupDTO.getEmailAndPhone(), code);
                } catch (ApiException apiException) {
                    response.setStatus(400);
                    response.setMessage("Số điện thoại không hổ trợ.");
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
                response.setStatus(201);
                response.setMessage("OTP đã được gửi.");
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            }
        } else if (isEmail(signupDTO.getEmailAndPhone())) {
            Accounts newAccounts = new Accounts();
            newAccounts.setUsername(signupDTO.getEmailAndPhone());
            newAccounts.setEmail(signupDTO.getEmailAndPhone());
            newAccounts.setCreatedAt(new Date());
            newAccounts.setActive(false);
            accountRepository.save(newAccounts);
            /////////////////////////////////////////
            OTP otp = otpRepository.findByUsername(newAccounts);
            if (otp != null) {
                Calendar cal = Calendar.getInstance();
                cal.setTime(new Date()); // Sử dụng thời gian hiện tại
                cal.add(Calendar.MINUTE, 3); // Thêm 3 phút
                OTP createOTP = new OTP();
                createOTP.setId(otp.getId());
                createOTP.setUsername(newAccounts);
                createOTP.setOtpCode(code);
                createOTP.setCreateTime(new Date());
                createOTP.setExpiredTime(cal.getTime());
                createOTP.setStatus(0);
                otpRepository.save(createOTP);
                emailService.sendEmailSigup(signupDTO.getEmailAndPhone(), "GreenHouse || Mã xác nhận", code);
                response.setStatus(201);
                response.setMessage("OTP đã được gửi.");
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            } else {
                Calendar cal = Calendar.getInstance();
                cal.setTime(new Date()); // Sử dụng thời gian hiện tại
                cal.add(Calendar.MINUTE, 3); // Thêm 3 phút
                OTP createOTP = new OTP();
                createOTP.setUsername(newAccounts);
                createOTP.setOtpCode(code);
                createOTP.setCreateTime(new Date());
                createOTP.setExpiredTime(cal.getTime());
                createOTP.setStatus(0);
                otpRepository.save(createOTP);
                emailService.sendEmailSigup(signupDTO.getEmailAndPhone(), "GreenHouse || Mã xác nhận", code);
                response.setStatus(201);
                response.setMessage("OTP đã được gửi.");
                return new ResponseEntity<>(response, HttpStatus.CREATED);
            }
        } else {
            response.setStatus(400);
            response.setMessage("Email hoặc số điện thoại không hợp lệ");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    private boolean validatePassword(String password) {
        Matcher matcher = pattern.matcher(password);
        return matcher.matches();
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

    private boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    public String generateRandomCode() {
        int codeLength = 6;

        String characters = "0123456789";

        StringBuilder code = new StringBuilder();
        Random random = new Random();

        for (int i = 0; i < codeLength; i++) {
            int index = random.nextInt(characters.length());
            code.append(characters.charAt(index));
        }

        return code.toString();
    }
}
