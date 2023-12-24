package com.greenhouse.restcontroller.admin;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.model.Authorities;
import com.greenhouse.model.OrderDetails;
import com.greenhouse.model.Orders;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.repository.AuthoritiesRepository;
import com.greenhouse.repository.OrderDetailsRepository;
import com.greenhouse.repository.OrdersRepository;
import com.greenhouse.repository.ProductDetailRepository;
import com.greenhouse.service.EmailService;

@RestController
@CrossOrigin("*")
@RequestMapping(value = "/rest/order")
public class RestOrderController {

    @Autowired
    private ProductDetailRepository productDetailRepository;
    @Autowired
    private AuthoritiesRepository authoritiesRepository;
    @Autowired
    private OrdersRepository ordersRepository;
    @Autowired
    EmailService sendEmail;
    @Autowired
    private OrderDetailsRepository orderDetailsRepository;

    @GetMapping("/getData")
    private ResponseEntity<Map<String, Object>> getData() {
        Map<String, Object> responseData = new HashMap<>();

        List<Product_Detail> productDetails = productDetailRepository.findAll();
        List<Authorities> authorities = authoritiesRepository.findAll();
        List<Orders> listOrders = ordersRepository.findAll();
        responseData.put("listOrders", listOrders);
        responseData.put("productDetails", productDetails);
        responseData.put("authorities", authorities);

        return ResponseEntity.ok(responseData);
    }

    @GetMapping("/getOrderInfo/{orderCode}")
    private ResponseEntity<Map<String, Object>> getOrderInfo(@PathVariable String orderCode) {
        Map<String, Object> responseData = new HashMap<>();

        // Lấy thông tin đơn hàng
        Optional<Orders> order = ordersRepository.findById(orderCode);
        order.ifPresent(value -> responseData.put("order", value));

        // Lấy thông tin đơn hàng chi tiết
        List<OrderDetails> orderDetails = orderDetailsRepository.findByOrderCode(orderCode);
        responseData.put("orderDetails", orderDetails);

        return ResponseEntity.ok(responseData);
    }

    @PutMapping("/cancelOrder/{orderCode}")
    public ResponseEntity<String> cancelOrder(@PathVariable String orderCode, @RequestBody Orders updatedOrder) {
        Optional<Orders> optionalOrder = ordersRepository.findById(orderCode);

        if (optionalOrder.isPresent()) {
            Orders existingOrder = optionalOrder.get();

            // Update order status, confirmed_By, and save cancellation reason (note)
            existingOrder.setStatus(updatedOrder.getStatus());
            existingOrder.setConfirmed_By(updatedOrder.getConfirmed_By());
            existingOrder.setNote(updatedOrder.getNote());
            existingOrder.setOrderCodeGHN(updatedOrder.getOrderCodeGHN());
            existingOrder.setExpected_delivery_time(updatedOrder.getExpected_delivery_time());
            ordersRepository.save(existingOrder);
            if ("cancel".equalsIgnoreCase(updatedOrder.getStatus())) {
                // Gửi email thông báo hủy đơn hàng
                sendEmail.sendEmailOrderCancellation(existingOrder.getAccount().getEmail(), "GreenHouse | Hủy Đơn Hàng",
                        orderCode,
                        existingOrder.getNote());
                return ResponseEntity.ok("Đã hủy đơn hàng");
            } else {
                return ResponseEntity.ok("Đã duyệt đơn hàng");
            }

        } else {
            return ResponseEntity.badRequest().body("Không thể hủy đơn hàng với trạng thái hiện tại");
        }
    }

}
