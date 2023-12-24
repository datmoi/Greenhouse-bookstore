package com.greenhouse.restcontroller.client;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.greenhouse.dto.client.CheckoutCompleteDTO;
import com.greenhouse.dto.client.CheckoutDTO;
import com.greenhouse.model.Carts;
import com.greenhouse.model.Flash_Sales;
import com.greenhouse.model.InvoiceDetails;
import com.greenhouse.model.InvoiceMappingStatus;
import com.greenhouse.model.InvoiceMappingVoucher;
import com.greenhouse.model.Invoices;
import com.greenhouse.model.OrderDetails;
import com.greenhouse.model.Orders;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Product_Flash_Sale;
import com.greenhouse.repository.FlashSalesRepository;
import com.greenhouse.repository.InvoiceDetailsRepository;
import com.greenhouse.repository.InvoiceMappingStatusRepository;
import com.greenhouse.repository.InvoiceMappingVoucherRepository;
import com.greenhouse.repository.InvoicesRepository;
import com.greenhouse.repository.OrderDetailsRepository;
import com.greenhouse.repository.OrdersRepository;
import com.greenhouse.repository.ProductDetailRepository;
import com.greenhouse.repository.Product_FlashSaleRepository;
import com.greenhouse.service.CheckoutService;
import com.greenhouse.service.PayOSService;
import com.greenhouse.service.VNPayService;

import jakarta.servlet.http.HttpServletResponse;

@RestController
@CrossOrigin("*")
@RequestMapping("/customer/rest/checkout")
public class CheckoutController {

    private CheckoutDTO checkoutData;
    private CheckoutCompleteDTO checkoutCompleteData;

    @Autowired
    private CheckoutService checkoutService;
    @Autowired
    private InvoiceDetailsRepository invoiceDetailsRepository;
    @Autowired
    private OrderDetailsRepository orderDetailsRepository;
    @Autowired
    private InvoiceMappingVoucherRepository invoiceMappingVoucherRepository;
    @Autowired
    private VNPayService vnPayService;
    @Autowired
    private PayOSService payOSService;
    @Autowired
    private InvoicesRepository invoicesRepository;
    @Autowired
    private InvoiceMappingStatusRepository invoiceMappingStatusRepository;
    @Autowired
    private OrdersRepository ordersRepository;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    @Autowired
    private ProductDetailRepository productDetailsRepository;
    @Autowired
    private FlashSalesRepository flashSalesRepository;
    @Autowired
    private Product_FlashSaleRepository product_FlashSaleRepository;

    @GetMapping("/getData")
    public ResponseEntity<Map<String, Object>> getData() {
        Map<String, Object> response = new HashMap<String, Object>();
        String status = "";
        String message = "";
        // -----------------------------------------
        try {
            response.put("checkoutData", checkoutData);
        } catch (Exception e) {
            System.out.println(e);
            status = "error";
            message = "Lỗi get data checkout";
        }
        // -----------------------------------------
        status = "success";
        message = "Get data checkout thành công";
        response.put("status", status);
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    // ==================================================================================================
    @PostMapping("/setData")
    public ResponseEntity<Map<String, Object>> setData(@RequestBody CheckoutDTO data) {
        Map<String, Object> response = new HashMap<String, Object>();
        String status = "";
        String message = "";
        // -----------------------------------------
        checkoutData = data;
        try {
            boolean appliedVoucher = false;
            boolean validVoucher = false;
            if (data.getVoucher() != null) {
                appliedVoucher = true;
                if (checkoutService.validVoucher(data.getVoucher())) {
                    validVoucher = true;
                }
            }
            if (appliedVoucher && !validVoucher) {
                status = "error-voucher";
                message = "Mã giảm đã hết lượt sử dụng.";
                response.put("status", status);
                response.put("message", message);
                return ResponseEntity.ok(response);
            }
            List<Carts> notValidCarts = validQuantityInStockProduct(data.getCarts());
            if (notValidCarts.size() > 0) {
                status = "error-product";
                message = "Số lượng sản phẩm không đủ hoặc đã hết hàng.";
                response.put("status", status);
                response.put("message", message);
                response.put("invalidProducts", notValidCarts);
                return ResponseEntity.ok(response);
            }
            notValidCarts = validQuantityInStockFlashSaleProduct(data.getCarts());
            if (notValidCarts.size() > 0) {
                status = "error-flashSale-product";
                message = "Số lượng còn lại của sản phẩm đã được đăng ký bán trong Flash Sale.";
                response.put("status", status);
                response.put("message", message);
                response.put("invalidProducts", notValidCarts);
                return ResponseEntity.ok(response);
            }

            response.put("checkoutData", checkoutData);
        } catch (Exception e) {
            System.out.println(e);
            status = "error";
            message = "Lỗi set data checkout";
        }
        // -----------------------------------------
        status = "success";
        message = "Set data checkout thành công";
        response.put("status", status);
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    // ==================================================================================================
    @PostMapping("/create-payment")
    public ResponseEntity<Map<String, Object>> createPayment(@RequestBody CheckoutDTO data) {
        Map<String, Object> response = new HashMap<String, Object>();
        String status = "success";
        String message = "Create payment success";
        try {
            // Create invoice
            Invoices invoices = checkoutService.createInvoice(data);

            // Create invoice status mapping with id = 2
            checkoutService.createInvoiceStatusMapping(invoices, 2); // id:2 = chưa thanh toán

            // Create order
            Orders order = checkoutService.createOrder(data, invoices);

            // Create order status history
            checkoutService.createOrderStatusHistory(order.getOrderCode(), "pending_confirmation");

            // Create invoice details and order details
            checkoutService.createInvoiceDetailsAndOrderDetails(data.getCarts(), invoices, order);

            // Subtract product quantity
            checkoutService.subtractProductQuantity(data.getCarts());

            // Update cart status
            checkoutService.updateCartStatus(data.getCarts());

            // Create invoice mapping voucher
            checkoutService.createInvoiceMappingVoucher(data, invoices,
                    data.getUsername());

            response.put("invoices", invoices);
            response.put("order", order);
            response.put("payment_method", data.getPayment_method());
            // Create url for payment
            if (data.getPayment_method().equalsIgnoreCase("cod")) {
                checkoutService.createInvoiceStatusMapping(invoices, 1); // id:1 = đã thanh toán
                CheckoutCompleteDTO temp = new CheckoutCompleteDTO();
                temp.setInvoices(invoices);
                temp.setOrders(order);
                checkoutCompleteData = temp;
                response.put("url", "http://localhost:8081/checkout-complete");
            } else if (data.getPayment_method().equalsIgnoreCase("vnPay")) {
                Map<String, Object> vnpayData = vnPayService.createVNPayUrl(invoices, order);
                String vnPayUrl = vnpayData.get("data").toString();
                response.put("url", vnPayUrl);
            } else if (data.getPayment_method().equalsIgnoreCase("payOS")) {
                String payOSUrl = payOSService.sendPaymentRequest(invoices, order);
                response.put("url", payOSUrl);
            }

            // ----------------------------------------------------------------
        } catch (Exception e) {
            status = "error";
            message = "lỗi api thanh toánn";
            throw new RuntimeException("Error processing payment", e);
        }
        response.put("status", status);
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    // ==================================================================================================
    @PostMapping("/vnPay-payment-callback")
    public void paymentCallback(@RequestBody Map<String, String> request, HttpServletResponse response) {
        try {
            // Begin process return from VNPAY
            String invoiceId = request.get("vnp_OrderInfo");
            String orderCode = request.get("vnp_TxnRef");
            Invoices invoices = invoicesRepository.findById(Integer.parseInt(invoiceId)).orElse(null);
            Orders orders = ordersRepository.findById(orderCode).orElse(null);
            String bankCode = request.get("vnp_BankCode");
            if (bankCode != null && !bankCode.equals("")) {
                invoices.setBankCode(bankCode);
                invoicesRepository.save(invoices);
            }
            CheckoutCompleteDTO checkoutCompleteDTO = new CheckoutCompleteDTO();
            checkoutCompleteDTO.setInvoices(invoices);
            checkoutCompleteDTO.setOrders(orders);
            checkoutCompleteData = checkoutCompleteDTO;
            if ("00".equals(request.get("vnp_ResponseCode"))) {
                // Update status of invoice
                checkoutService.createInvoiceStatusMapping(invoices, 1);
            } else {
                // Update status of invoice
                checkoutService.createInvoiceStatusMapping(invoices, 3);
                orders.setStatus("cancel");
                ordersRepository.save(orders);
                checkoutService.createOrderStatusHistory(orders.getOrderCode(), "cancel");
            }
        } catch (Exception e) {
            System.out.println("{\"RspCode\":\"99\",\"Message\":\"Unknow error\"}");
        }
    }

    // ==================================================================================================
    @PostMapping("/payOS-payment-callback")
    public void payOSpaymentCallback(@RequestBody Map<String, String> request, HttpServletResponse response) {
        try {
            // Begin process return from VNPAY
            String code = request.get("code");
            String status = request.get("status");
            String orderCode = "GH" + request.get("orderCode");

            Orders orders = ordersRepository.findById(orderCode).orElse(null);
            if (orders != null) {
                Invoices invoices = orders.getInvoices();
                CheckoutCompleteDTO checkoutCompleteDTO = new CheckoutCompleteDTO();
                checkoutCompleteDTO.setInvoices(invoices);
                checkoutCompleteDTO.setOrders(orders);
                checkoutCompleteData = checkoutCompleteDTO;
                if ("00".equals(code)) {
                    // Update status of invoice
                    if ("PAID".equalsIgnoreCase(status)) {
                        checkoutService.createInvoiceStatusMapping(invoices, 1);
                    } else {
                        checkoutService.createInvoiceStatusMapping(invoices, 3);
                        orders.setStatus("cancel");
                        ordersRepository.save(orders);
                        checkoutService.createOrderStatusHistory(orders.getOrderCode(), "cancel");
                    }
                }
            }

        } catch (Exception e) {
            System.out.println("{\"RspCode\":\"99\",\"Message\":\"Unknow error\"}");
        }
    }

    // ==================================================================================================

    @GetMapping("/getCheckoutCompleteData")
    public ResponseEntity<Map<String, Object>> getCheckoutCompleteData() {
        Map<String, Object> response = new HashMap<String, Object>();
        String status = "";
        String message = "";
        // ----------------------------------------------------------------

        if (checkoutCompleteData != null) {
            InvoiceMappingStatus statusInvoice = invoiceMappingStatusRepository
                    .findTopByInvoiceOrderByUpdateAtDesc(checkoutCompleteData.getInvoices());
            Invoices invoices = checkoutCompleteData.getInvoices();
            Orders orders = checkoutCompleteData.getOrders();
            List<InvoiceDetails> invoiceDetails = invoiceDetailsRepository
                    .findByInvoice(invoices);
            List<OrderDetails> orderDetails = orderDetailsRepository
                    .findByOrderCode(orders.getOrderCode());
            List<InvoiceMappingVoucher> imv = invoiceMappingVoucherRepository
                    .findByInvoice(invoices);
            // -----------------------------------------
            response.put("invoice", invoices);
            response.put("order", orders);
            response.put("orderDetails", orderDetails);
            response.put("invoiceDetails", invoiceDetails);
            response.put("invoiceMV", imv);

            // -----------------------------------------
            if (statusInvoice.getPaymentStatus().getStatusId() == 1) {
                status = "success";
                message = "Đơn hàng đã được thanh toán thành công";
            } else {
                orders.setStatus("cancel");
                ordersRepository.save(orders);
                status = "error";
                message = "Đơn hàng chưa được thanh toán";
            }
            // Sau khi tạo sản phẩm thành công, gửi thông báo đến client sử dụng WebSocket
            messagingTemplate.convertAndSend("/topic/products", "update");
        }
        // -----------------------------------------

        response.put("status", status);
        response.put("message", message);
        // ----------------------------------------------------------------
        return ResponseEntity.ok(response);
    }
    // ==================================================================================================

    private List<Carts> validQuantityInStockProduct(List<Carts> listCarts) {
        List<Carts> notValidCarts = new ArrayList<>();
        if (listCarts.size() > 0) {
            for (Carts cart : listCarts) {
                Product_Detail pDetail = productDetailsRepository.findById(cart.getProductDetail().getProductDetailId())
                        .orElse(null);
                if (pDetail != null) {
                    if (pDetail.getQuantityInStock() - cart.getQuantity() < 0) {
                        notValidCarts.add(cart);
                    }
                }
            }
        }
        return notValidCarts;
    }

    private List<Carts> validQuantityInStockFlashSaleProduct(List<Carts> listCarts) {
        List<Carts> notValidCarts = new ArrayList<>();

        List<Flash_Sales> listFlashSales = flashSalesRepository.findFlashSalesComingSoon();

        for (Flash_Sales flash_Sales : listFlashSales) {
            for (Carts cart : listCarts) {
                Product_Flash_Sale productFlashSale = product_FlashSaleRepository
                        .findByFlashSaleIdAndProductDetail(flash_Sales, cart.getProductDetail());
                if (productFlashSale != null) {
                    if (productFlashSale.getQuantity() >= cart.getProductDetail().getQuantityInStock()) {
                        notValidCarts.add(cart);
                    }
                }
            }
        }

        return notValidCarts;
    }

}
