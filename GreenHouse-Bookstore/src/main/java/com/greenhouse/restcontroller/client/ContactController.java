package com.greenhouse.restcontroller.client;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.dto.client.ContactDTO;
import com.greenhouse.service.EmailService;

@RestController
@RequestMapping("/send")
public class ContactController {

    @Autowired
    EmailService emailService;

    @PostMapping("/send-contact")
    public ResponseEntity<Map<String, Object>> sendEmail(@RequestBody ContactDTO contactDTO) {
        Map<String, Object> response = new HashMap<>();

        if (contactDTO.getEmail() == null || contactDTO.getFullName() == null
                || contactDTO.getContent() == null) {
            response.put("status", 400);
            response.put("message", "Thông tin không được để trống.");
            return ResponseEntity.ok(response);
        } else if (!isEmail(contactDTO.getEmail())) {
            response.put("status", 400);
            response.put("message", "Email không chính xác.");
            return ResponseEntity.ok(response);
        }

        emailService.sendEmailContact("greenhouse20033@gmail.com", "Phản hồi từ khách hàng", contactDTO);
        response.put("status", 200);
        response.put("message", "Cảm ơn bạn! Phản hồi của bạn rất quan trọng đối với chúng tôi. Chúng tôi sẽ xem xét kỹ và cải thiện dựa trên ý kiến của bạn. Chúc bạn một ngày tốt lành!");
        return ResponseEntity.ok(response);
    }

    // Kiểm tra xem chuỗi có phải là một địa chỉ email hay không
    private boolean isEmail(String input) {
        // Biểu thức chính quy kiểm tra địa chỉ email đơn giản
        String emailPattern = "^[A-Za-z0-9+_.-]+@(.+)$";
        return Pattern.matches(emailPattern, input);
    }
}
