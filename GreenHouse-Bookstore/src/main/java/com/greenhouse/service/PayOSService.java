package com.greenhouse.service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.HashMap;
import java.util.Map;

import org.apache.commons.lang3.RandomStringUtils;
import org.json.JSONObject;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.greenhouse.model.Invoices;
import com.greenhouse.model.Orders;

@Service
public class PayOSService {

    private String payOSApiUrl = "https://api-merchant.payos.vn/v2/payment-requests";

    private String apiKey = "453784e6-97b2-4f46-85cd-19d5501256e6";

    private String clientId = "5420cf88-a92c-4147-a248-b2d763137159";

    private String checkSumKey = "e5dbc7f4a0d46881802e6f504d8fee3550cb27a472a4e982314cd34b9990189e";

    private RestTemplate restTemplate = new RestTemplate();

    public String sendPaymentRequest(Invoices invoices, Orders orders) {
        try {
            // Chuẩn bị request data
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("amount", Double.valueOf(invoices.getPaymentAmount()).intValue());
            requestData.put("cancelUrl", "http://localhost:8081/checkout-complete/payment-callback");
            requestData.put("description", orders.getOrderCode());
            String orderCode = orders.getClientOrderCode().substring(2);
            Long orderCodeLong = Long.parseLong(orderCode);
            requestData.put("orderCode", orderCodeLong);

            requestData.put("returnUrl", "http://localhost:8081/checkout-complete/payment-callback");
            LocalDateTime expirationTime = LocalDateTime.now().plusMinutes(15);
            long unixTimestamp = expirationTime.atZone(ZoneId.systemDefault()).toEpochSecond();

            // Thêm chữ ký vào requestData
            String signature = generateSignature(requestData, checkSumKey);
            requestData.put("signature", signature);
            requestData.put("expirationTime", unixTimestamp);

            // Cấu hình header
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);

            // Gửi yêu cầu và nhận phản hồi
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestData, headers);

            // Sử dụng exchange thay thế postForEntity
            ResponseEntity<String> responseEntity = restTemplate.exchange(
                    payOSApiUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class);

            // Lấy thông tin từ phản hồi
            HttpStatusCode statusCode = responseEntity.getStatusCode();

            // Xử lý phản hồi tùy thuộc vào mã trạng thái HTTP và nội dung phản hồi
            if (statusCode == HttpStatus.OK) {
                JSONObject responseBodyJSON = new JSONObject(responseEntity.getBody());
                System.out.println("--------------------------------" + responseBodyJSON.toString());
                String code = responseBodyJSON.getString("code");
                if ("00".equalsIgnoreCase(code)) {
                    String checkoutUrl = responseBodyJSON.getJSONObject("data").getString("checkoutUrl");
                    return checkoutUrl;
                } else {
                    System.out.println("Lỗi trong quá trình gửi yêu cầu. Mã trạng thái: " + statusCode);
                    return null;
                }
            } else {
                System.out.println("Lỗi trong quá trình gửi yêu cầu. Mã trạng thái: " + statusCode);
                return null;
            }
        } catch (Exception e) {
            // Xử lý lỗi
            e.printStackTrace();
            return null;
        }
    }

    public void cancelPaymentRequest(String orderCode) {
        try {
            // Tạo URL của API hủy thanh toán
            String cancelUrl = payOSApiUrl + "/" + orderCode + "/cancel";

            // Chuẩn bị request data
            Map<String, Object> requestData = new HashMap<>();
            requestData.put("cancellationReason", "Changed my mind");

            // Cấu hình header
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("x-client-id", clientId);
            headers.set("x-api-key", apiKey);

            // Gửi yêu cầu và nhận phản hồi
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestData, headers);
            ResponseEntity<String> responseEntity = restTemplate.exchange(
                    cancelUrl,
                    HttpMethod.POST,
                    requestEntity,
                    String.class);

            // Lấy thông tin từ phản hồi
            HttpStatusCode statusCode = responseEntity.getStatusCode();

            // Xử lý phản hồi tùy thuộc vào mã trạng thái HTTP và nội dung phản hồi
            if (statusCode == HttpStatus.OK) {
                JSONObject responseBodyJSON = new JSONObject(responseEntity.getBody());
                System.out.println("Cancel Response: " + responseBodyJSON.toString());
            } else {
                System.out.println("Lỗi trong quá trình gửi yêu cầu hủy thanh toán. Mã trạng thái: " + statusCode);
            }
        } catch (Exception e) {
            // Xử lý lỗi
            e.printStackTrace();
        }
    }

    private String generateSignature(Map<String, Object> requestData, String secretKey)
            throws NoSuchAlgorithmException, InvalidKeyException {
        // Tạo chữ ký
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        SecretKeySpec secretKeySpec = new SecretKeySpec(keyBytes, "HmacSHA256");
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(secretKeySpec);

        StringBuilder dataToSign = new StringBuilder();
        for (Map.Entry<String, Object> entry : requestData.entrySet()) {
            dataToSign.append(entry.getKey()).append("=").append(entry.getValue()).append("&");
        }
        dataToSign.deleteCharAt(dataToSign.length() - 1);

        byte[] signatureBytes = mac.doFinal(dataToSign.toString().getBytes(StandardCharsets.UTF_8));
        StringBuilder signature = new StringBuilder();
        for (byte b : signatureBytes) {
            signature.append(String.format("%02x", b));
        }

        return signature.toString();
    }
}
