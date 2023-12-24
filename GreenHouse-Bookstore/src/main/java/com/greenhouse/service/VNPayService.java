package com.greenhouse.service;

import com.greenhouse.configuration.VNPayConfig;
import com.greenhouse.model.Invoices;
import com.greenhouse.model.Orders;

import jakarta.servlet.http.HttpServletRequest;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class VNPayService {

    @Autowired
    private HttpServletRequest request;

    public Map<String, Object> createVNPayUrl(Invoices invoices, Orders orders) {
        try {
            String paymentUrl = prepareVnpParams(invoices, orders);

            Map<String, Object> responseMap = new HashMap<>();
            responseMap.put("code", "00");
            responseMap.put("message", "success");
            responseMap.put("data", paymentUrl);

            return responseMap;
        } catch (Exception e) {
            // Xử lý exception khi gặp lỗi
            e.printStackTrace();
            Map<String, Object> errorMap = new HashMap<>();
            errorMap.put("code", "99");
            errorMap.put("message", "error");
            errorMap.put("data", null);
            return errorMap;
        }
    }

    // ================================================================================================
    private String prepareVnpParams(Invoices invoices, Orders orders) throws UnsupportedEncodingException {
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");

        String vnp_Version = VNPayConfig.vnp_Version;
        String vnp_Command = VNPayConfig.vnp_Command;
        String vnp_TmnCode = VNPayConfig.vnp_TmnCode;
        long vnp_Amount = Double.valueOf(invoices.getPaymentAmount()).intValue() * 100;
        String vnp_CreateDate = formatter.format(cld.getTime());
        String vnp_CurrCode = "VND";
        String vnp_IpAddr = getCustomerIP();
        String vnp_Local = "vn";
        String vnp_ReturnUrl = VNPayConfig.vnp_ReturnUrl;
        String vnp_TxnRef = orders.getOrderCode();
        String vnp_OrderInfo = String.valueOf(invoices.getInvoiceId());
        String vnp_OrderType = VNPayConfig.vnp_OrderType;
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(vnp_Amount));
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_CurrCode", vnp_CurrCode);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_Locale", vnp_Local);
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = (String) itr.next();
            String fieldValue = (String) vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayConfig.hmacSHA512(VNPayConfig.vnp_HashSecret, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        return VNPayConfig.vnp_PayUrl + "?" + queryUrl;

    }

    private String getCustomerIP() {
        String ipAddress = request.getRemoteAddr();
        return ipAddress;
    }
}
