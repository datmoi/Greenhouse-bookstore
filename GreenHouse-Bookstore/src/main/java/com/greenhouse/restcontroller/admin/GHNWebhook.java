package com.greenhouse.restcontroller.admin;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.model.Orders;
import com.greenhouse.repository.OrdersRepository;
import com.greenhouse.service.CheckoutService;

@RestController
@RequestMapping("/ghn")
public class GHNWebhook {

    @Autowired
    private OrdersRepository ordersRepository;
    @Autowired
    private CheckoutService checkoutService;

    @PostMapping("/ghn-callback")
    public void ghnCallback(@RequestBody Map<String, String> payload) {
        System.out.println("Received GHN Callback: " + payload);

        String orderCode = payload.get("OrderCode");
        String status = payload.get("Status");
        String type = payload.get("Type");
        if ("create".equalsIgnoreCase(type) || "switch_status".equalsIgnoreCase(type)) {
            // 1. Update the database with new data from GHN
            Orders orders = ordersRepository.findById(orderCode).orElse(null);
            if (orders != null && !"cancelled".equalsIgnoreCase(status)) {
                orders.setStatus(status);
                ordersRepository.saveAndFlush(orders);
                checkoutService.createOrderStatusHistory(orderCode, status);
                if("delivered".equalsIgnoreCase(status)) {
                    checkoutService.createInvoiceStatusMapping(orders.getInvoices(), 1);// status = 1 : đã thanh toán
                }
            }
        }
    }
}