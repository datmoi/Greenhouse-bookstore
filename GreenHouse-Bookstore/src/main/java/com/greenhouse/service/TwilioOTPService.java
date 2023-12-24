package com.greenhouse.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.greenhouse.configuration.TwilioConfig;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

@Service
public class TwilioOTPService {

    @Autowired
    private TwilioConfig twilioConfig;

    public void sendOTP(String phoneNumber, String otp) {
        Twilio.init(twilioConfig.getAccountSid(), twilioConfig.getAuthToken());

        String internationalFormat = "+84" + phoneNumber.substring(1);
        PhoneNumber to = new PhoneNumber(internationalFormat);
        PhoneNumber from = new PhoneNumber(twilioConfig.getTrialNumber());

        String otpMessage = "Mã xác nhận từ GreenHouse gửi đến bạn là: " + otp;
        Message.creator(to, from, otpMessage).create();
    }

    public void sendOTPForgotPassword(String phoneNumber, String token) {
        Twilio.init(twilioConfig.getAccountSid(), twilioConfig.getAuthToken());

        String internationalFormat = "+84" + phoneNumber.substring(1);
        PhoneNumber to = new PhoneNumber(internationalFormat);
        PhoneNumber from = new PhoneNumber(twilioConfig.getTrialNumber());

        String otpMessage = "Để đặt lại mật khẩu của bạn, vui lòng nhấp vào đường link sau: http://localhost:8081/change-password?token=" + token;
        System.out.println("http://localhost:8081/change-password?token=" + token);
        Message.creator(to, from, otpMessage).create();
    }
}
