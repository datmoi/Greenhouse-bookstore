package com.greenhouse.restcontroller.client;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.model.OrderDetails;
import com.greenhouse.model.Orders;
import com.greenhouse.model.Product_Reviews;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.OrderDetailsRepository;
import com.greenhouse.repository.OrdersRepository;
import com.greenhouse.repository.ProductDetailRepository;
import com.greenhouse.repository.ProductReviewsRepository;
import com.greenhouse.repository.ProductsRepository;
import com.greenhouse.service.EmailService;

import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/customer/rest/order")
public class OrderController {
    @Autowired
    OrderDetailsRepository od;
    @Autowired
    OrdersRepository o;
    @Autowired
    AccountRepository a;
    @Autowired
    ProductsRepository p;
    @Autowired
    ProductDetailRepository pd;
    @Autowired
    EmailService sendEmail;
    @Autowired
    ProductReviewsRepository productReviewsRepository;

    @GetMapping("/{username}")
    public Map<String, Object> getOrders(@PathVariable String username) {
        Map<String, Object> response = new HashMap<>();
        List<Orders> orders = o.findByUsername(username);
        // Kiểm tra xem có bản ghi nào thỏa mãn các điều kiện đã cho hay không
        response.put("orders", orders);
        return response;
    }

    @GetMapping("/reviews/{orderCode}")
    public List<Product_Reviews> getReviewsByOrderCode(@PathVariable String orderCode) {

        List<Product_Reviews> reviews = productReviewsRepository.findByOrder_OrderCode(orderCode);

        return reviews;
    }

    @Transactional
    @GetMapping("/orderdetails-with-reviews/{orderCode}")
    public Map<String, Object> getOrderDetailsWithReviews(@PathVariable String orderCode) {
        Map<String, Object> result = new HashMap<>();

        // Lấy danh sách chi tiết đơn hàng
        List<OrderDetails> orderDetails = od.findByOrderCode(orderCode);
        result.put("orderDetails", orderDetails);

        // Lấy danh sách đánh giá
        List<Product_Reviews> reviews = productReviewsRepository.findByOrder_OrderCode(orderCode);
        result.put("reviews", reviews);

        return result;
    }

    @GetMapping("/{username}/{productDetailId}/{orderCode}")
    public ResponseEntity<Map<String, Object>> getOrders1(@PathVariable String username,
            @PathVariable int productDetailId,
            @PathVariable String orderCode) {

        Map<String, Object> response = new HashMap<>();
        // Kiểm tra xem có bản ghi nào thỏa mãn các điều kiện đã cho hay không
        boolean productExists = productReviewsRepository
                .existsByAccount_UsernameAndProductDetail_ProductDetailIdAndOrder_OrderCode(
                        username,
                        productDetailId,
                        orderCode);
        response.put("productExists", productExists);

        return ResponseEntity.ok(response);
    }

    @Transactional
    @GetMapping("/orderdetail/{orderCode}")
    public List<OrderDetails> getOrderDetail(@PathVariable String orderCode) {
        return od.findByOrderCode(orderCode);
    }

    @PutMapping("/cancelOrder/{orderCode}")
    public ResponseEntity<String> cancelOrder(@PathVariable String orderCode, @RequestBody Orders updatedOrder) {
        Optional<Orders> optionalOrder = o.findById(orderCode);

        if (optionalOrder.isPresent()) {
            Orders existingOrder = optionalOrder.get();
            // Update order status, confirmed_By, and save cancellation reason (note)
            existingOrder.setStatus(updatedOrder.getStatus());
            existingOrder.setConfirmed_By(updatedOrder.getConfirmed_By());
            existingOrder.setNote(updatedOrder.getNote());
            existingOrder.setOrderCodeGHN(updatedOrder.getOrderCodeGHN());
            existingOrder.setExpected_delivery_time(updatedOrder.getExpected_delivery_time());
            o.save(existingOrder);
            // Gửi email thông báo hủy đơn hàng
            sendEmail.sendEmailOrderCancellation(existingOrder.getAccount().getEmail(), "GreenHouse | Hủy Đơn Hàng",
                    orderCode,
                    existingOrder.getNote());
            return ResponseEntity.ok("Đã hủy đơn hàng");
        } else {
            return ResponseEntity.badRequest().body("Không thể hủy đơn hàng với trạng thái hiện tại");
        }
    }

    @PutMapping("/confirmOrder/{orderCode}")
    public ResponseEntity<String> confirmOrder(@PathVariable String orderCode) {
        Optional<Orders> optionalOrder = o.findById(orderCode);

        if (optionalOrder.isPresent()) {
            Orders existingOrder = optionalOrder.get();

            // Xác nhận đơn hàng (thay đổi status)
            existingOrder.setStatus("received");
            o.save(existingOrder);

            return ResponseEntity.ok("Đã xác nhận đơn hàng");
        } else {
            return ResponseEntity.badRequest().body("Không thể xác nhận đơn hàng với mã đơn hàng này");
        }
    }

    @GetMapping("/orderCancel/{orderCode}")
    public Orders getOrder_Cancel(@PathVariable String orderCode) {
        Orders order = o.findByOrderCode(orderCode);
        return order;
    }
}
