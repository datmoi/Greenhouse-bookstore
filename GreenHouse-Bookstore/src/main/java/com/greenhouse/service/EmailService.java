package com.greenhouse.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.greenhouse.dto.client.ContactDTO;
import com.greenhouse.model.Accounts;
import com.greenhouse.repository.AccountRepository;

import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private AccountRepository accountRepository;

    private void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);
            helper.setFrom("GreenHouse", "GreenHouse");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            javaMailSender.send(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void sendEmailSigup(String to, String subject, String confirmationCode) {
        String html = "<!DOCTYPE html>\r\n" + //
                "<html>\r\n" + //
                "<head>\r\n" + //
                "    <meta charset=\"UTF-8\">\r\n" + //
                "    <title>Xác Thực OTP</title>\r\n" + //
                "</head>\r\n" + //
                "<body>\r\n" + //
                "    <div style=\"background-color: white; font-family: Arial, sans-serif; padding: 20px; text-align: center;\">\r\n"
                + //
                "        <img src=\"https://down-ws-vn.img.susercontent.com/87ec164c0d56e1d4c58487973017ed3f_tn\" alt=\"Logo\" width=\"150\" height=\"150\">\r\n"
                + //
                "        <h2>Xác Thực OTP</h2>\r\n" + //
                "        <p>Vui lòng nhập mã OTP dưới đây để đăng ký tài khoản của bạn:</p>\r\n" + //
                "        <p style=\"font-size: 24px; font-weight: bold;\">Mã OTP: " + confirmationCode + "</p>\r\n" + //
                "        <p>Nếu bạn không yêu cầu mã OTP này, xin vui lòng bỏ qua email này. Mã OTP này sẽ hết hạn sau một thời gian nhất định.</p>\r\n"
                + "        <div style=\"background-color: #ffffff; padding: 20px; text-align: center;\">\r\n" + //
                "            <span style=\"color: gray;\">Email Hỗ Trợ: </span><a href=\"mailto:greenhousestore@gmail.com\" style=\"color: #007bff; text-decoration: none;\"><i class=\"fas fa-envelope\"></i>greenhousestore@gmail.com</a><br>\r\n"
                + //
                "            <span style=\"color: gray;\">Số Điện Thoại Hỗ Trợ: </span><a href=\"tel:+84886077296\" style=\"color: #007bff; text-decoration: none;\"><i class=\"fas fa-phone-alt\"></i>(+84) 886077296</a>\r\n"
                + //
                "        </div>\r\n"
                + //
                "        <p style=\"color: gray;\">GreenHouse©2023, Designed & Developed By Team GreenHouse</p>\r\n" +
                "    </div>\r\n" + //
                "</body>\r\n" + //
                "</html>\r\n" + //
                "";
        sendEmail(to, subject, html);
    }

    public void sendEmailFogotPassword(String to, String subject, String token) {
        String html = "<!DOCTYPE html>\r\n" + //
                "<html>\r\n" + //
                "<head>\r\n" + //
                "    <meta charset=\"UTF-8\">\r\n" + //
                "    <title>Đổi Mật Khẩu</title>\r\n" + //
                "</head>\r\n" + //
                "<body>\r\n" + //
                "    <div style=\"background-color: white; font-family: Arial, sans-serif; padding: 20px; text-align: center;\">\r\n"
                + //
                "        <img src=\"https://down-ws-vn.img.susercontent.com/87ec164c0d56e1d4c58487973017ed3f_tn\" alt=\"Logo\" width=\"150\" height=\"150\">\r\n"
                + //
                "        <h2>Thay đổi Mật Khẩu</h2>\r\n" + //
                "        <p>Vui lòng nhấp vào liên kết bên dưới để đổi mật khẩu tài khoản của bạn:</p>\r\n" + //
                "        <a href=\"http://localhost:8081/change-password?token=" + token
                + "\" style=\"background-color: green; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 10px;\">Đổi Mật Khẩu</a>\r\n"
                + //
                "        <p>Nếu bạn không yêu cầu đổi mật khẩu, xin vui lòng bỏ qua email này. Liên kết này sẽ hết hạn sau 24 giờ.</p>\r\n"
                + "        <div style=\"background-color: #ffffff; padding: 20px; text-align: center;\">\r\n" + //
                "            <span style=\"color: gray;\">Email Hỗ Trợ: </span><a href=\"mailto:greenhousestore@gmail.com\" style=\"color: #007bff; text-decoration: none;\"><i class=\"fas fa-envelope\"></i>greenhousestore@gmail.com</a><br>\r\n"
                + //
                "            <span style=\"color: gray;\">Số Điện Thoại Hỗ Trợ: </span><a href=\"tel:+84886077296\" style=\"color: #007bff; text-decoration: none;\"><i class=\"fas fa-phone-alt\"></i>(+84) 886077296</a>\r\n"
                + //
                "        </div>\r\n"
                + //
                "        <p style=\"color: gray;\">GreenHouse©2023, Designed & Developed By Team GreenHouse</p>\r\n" +
                "    </div>\r\n" + //
                "</body>\r\n" + //
                "</html>\r\n" + //
                "";
        sendEmail(to, subject, html);
    }

    public void sendEmailOrderCancellation(String to, String subject, String orderCode, String cancellationReason) {
        String html = "<!DOCTYPE html>\r\n" + //
                "<html>\r\n" + //
                "<head>\r\n" + //
                "    <meta charset=\"UTF-8\">\r\n" + //
                "    <title>Huỷ Đơn Hàng</title>\r\n" + //
                "<link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css\">\r\n"
                + //
                "" +
                "</head>\r\n" + //
                "<body>\r\n" + //
                "    <div style=\"background-color: white; font-family: Arial, sans-serif; padding: 20px; text-align: center;\">\r\n"
                + //
                "        <img src=\"https://down-ws-vn.img.susercontent.com/87ec164c0d56e1d4c58487973017ed3f_tn\" alt=\"Logo\" width=\"150\" height=\"150\">\r\n"
                + //
                "        <h2>Huỷ Đơn Hàng</h2>\r\n" + //
                "        <p>Đơn hàng của bạn với mã số <b>" + orderCode + "</b> đã được huỷ.</p>\r\n" + //
                "        <p>Lý do: " + cancellationReason + "</p>\r\n" + //
                "        <p>Nếu có bất kỳ câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi.</p>\r\n" + //
                "        <div class=\"contact-list\" style=\"background-color: white; font-family: Arial, sans-serif; padding: 20px; text-align: center;\">\r\n"
                + // Change the color to gray
                "            <span style=\"color: gray;\">Số Điện Thoại: </span> <a href=\"tel:+84886077296\" class=\"sin-contact\"><i class=\"fas fa-mobile-alt\"></i>(+84) 886077296</a>\r\n"
                +
                "            <span style=\"color: gray;\">Email: </span><a href=\"mailto:greenhousestore@gmail.com\" class=\"sin-contact\"><i class=\"fas fa-envelope\"></i>greenhousestore@gmail.com</a>\r\n"
                +
                "        <p style=\"color: gray;\">GreenHouse©2023, Designed & Developed By Team GreenHouse</p>\r\n" +
                "        </div>\r\n" +
                "    </div>\r\n" + //
                "</body>\r\n" + //
                "</html>\r\n" + //
                "";
        sendEmail(to, subject, html);
    }

    public void sendEmailContact(String to, String subject, ContactDTO contactDTO) {
        String html = "<!DOCTYPE html>\r\n" + //
                "<html lang=\"en\">\r\n" + //
                "<head>\r\n" + //
                "    <meta charset=\"UTF-8\">\r\n" + //
                "    <title>Phản Hồi về Dịch Vụ/Sản Phẩm</title>\r\n" + //
                "    <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css\">\r\n"
                + //
                "</head>\r\n" + //
                "<body style=\"background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px; text-align: center;\">\r\n"
                + //
                "\r\n" + //
                "    <div style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\">\r\n"
                + //
                "        <img src=\"https://down-ws-vn.img.susercontent.com/87ec164c0d56e1d4c58487973017ed3f_tn\" alt=\"Logo\" width=\"150\" height=\"150\">\r\n"
                + //
                "        <h2>Phản hồi về dịch vụ/Sản phẩm</h2>\r\n" + //
                "        <p>Xin chào GreenHouse,</p>\r\n" + //
                "        <p> \"Tôi " + contactDTO.getFullName()
                + ", muốn chia sẻ ý kiến của mình về dịch vụ hoặc sản phẩm mà tôi đã sử dụng.</p>\r\n" + //
                "        <label for=\"feedback\">Ý Kiến của tôi</label><br>\r\n" + //
                "        <p>" + contactDTO.getContent() + ".</p>\r\n" + //
                "        \r\n" + //
                "        <div style=\"background-color: #ffffff; padding: 20px; text-align: center;\">\r\n" + //
                "            <span style=\"color: gray;\">Email: </span><a href=\"mailto:" + contactDTO.getEmail()
                + "; \" style=\"color: #007bff; text-decoration: none;\"><i class=\"fas fa-envelope\"></i>"
                + contactDTO.getEmail() + "</a>\r\n" + //
                "        </div>\r\n" + //
                "        \r\n" + //
                "        <p style=\"color: gray;\">GreenHouse©2023, Designed & Developed By Team GreenHouse</p>\r\n" + //
                "    </div>\r\n" + //
                "\r\n" + //
                "</body>\r\n" + //
                "</html>\r\n" + //
                "";
        sendEmail(to, subject, html);
    }

    @Scheduled(cron = "0 0 0 1 * ?") // Chạy lúc 12h đêm vào ngày 1 hàng tháng
    private void sendding() {
        List<Accounts> listAccount = accountRepository.findAllByActiveTrue();
        String html = "<!DOCTYPE html>\r\n" + //
                "<html lang=\"en\">\r\n" + //
                "<head>\r\n" + //
                "    <meta charset=\"UTF-8\">\r\n" + //
                "    <title>Tri Ân Khách Hàng</title>\r\n" + //
                "    <link rel=\"stylesheet\" href=\"https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css\">\r\n"
                + //
                "</head>\r\n" + //
                "<body style=\"background-color: #f4f4f4; font-family: Arial, sans-serif; padding: 20px; text-align: center;\">\r\n"
                + //
                "\r\n" + //
                "    <div style=\"max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);\">\r\n"
                + //
                "        <img src=\"https://down-ws-vn.img.susercontent.com/87ec164c0d56e1d4c58487973017ed3f_tn\" alt=\"Logo\" width=\"150\" height=\"150\">\r\n"
                + //
                "        <h2>Chân thành cảm ơn sự đồng hành của bạn!</h2>\r\n" + //
                "        <p>Chúng tôi đánh giá cao sự phản hồi và ý kiến của bạn về dịch vụ/sản phẩm của chúng tôi.</p>\r\n"
                + //
                "        <p>Nếu có bất kỳ điều gì chúng tôi có thể cải thiện hoặc hỗ trợ, đừng ngần ngại liên hệ với chúng tôi.</p>\r\n"
                + //
                "\r\n" + //
                "        <div style=\"background-color: #ffffff; padding: 20px; text-align: center;\">\r\n" + //
                "            <span style=\"color: gray;\">Email Hỗ Trợ: </span><a href=\"mailto:greenhousestore@gmail.com\" style=\"color: #007bff; text-decoration: none;\"><i class=\"fas fa-envelope\"></i>greenhousestore@gmail.com</a><br>\r\n"
                + //
                "            <span style=\"color: gray;\">Số Điện Thoại Hỗ Trợ: </span><a href=\"tel:+84886077296\" style=\"color: #007bff; text-decoration: none;\"><i class=\"fas fa-phone-alt\"></i>(+84) 886077296</a>\r\n"
                + //
                "        </div>\r\n" + //
                "\r\n" + //
                "        <p style=\"color: gray;\">Nhận ngay <a href=\"http://greenhouse-v1-env.eba-2yfkh2vp.us-east-1.elasticbeanstalk.com/voucher\">voucher</a> đặc biệt khi mua sắm tại cửa hàng GreenHouse!</p>\r\n"
                + //
                "\r\n" + //
                "        <p style=\"color: gray;\">GreenHouse©2023, Designed & Developed By Team GreenHouse</p>\r\n" + //
                "    </div>\r\n" + //
                "\r\n" + //
                "</body>\r\n" + //
                "</html>\r\n" + //
                "";
        for (Accounts accounts : listAccount) {
            sendEmail(accounts.getEmail(), "Cảm ơn quý khách", html);
        }
    }
}
