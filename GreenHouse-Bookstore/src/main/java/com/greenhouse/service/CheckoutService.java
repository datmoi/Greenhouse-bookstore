package com.greenhouse.service;

import java.sql.Time;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.number.NumberStyleFormatter;
import org.springframework.stereotype.Service;
import com.greenhouse.dto.client.CartVoucherDTO;
import com.greenhouse.dto.client.CheckoutDTO;
import com.greenhouse.model.Accounts;
import com.greenhouse.model.Carts;
import com.greenhouse.model.Discounts;
import com.greenhouse.model.Flash_Sales;
import com.greenhouse.model.InvoiceDetails;
import com.greenhouse.model.InvoiceMappingStatus;
import com.greenhouse.model.InvoiceMappingVoucher;
import com.greenhouse.model.Invoices;
import com.greenhouse.model.OrderDetails;
import com.greenhouse.model.OrderInfo;
import com.greenhouse.model.Order_Status_History;
import com.greenhouse.model.Orders;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Product_Discount;
import com.greenhouse.model.Product_Flash_Sale;
import com.greenhouse.model.Products;
import com.greenhouse.model.UserVoucher;
import com.greenhouse.model.Vouchers;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.CartsRepository;
import com.greenhouse.repository.DiscountsRepository;
import com.greenhouse.repository.FlashSalesRepository;
import com.greenhouse.repository.InvoiceDetailsRepository;
import com.greenhouse.repository.InvoiceMappingStatusRepository;
import com.greenhouse.repository.InvoiceMappingVoucherRepository;
import com.greenhouse.repository.InvoicesRepository;
import com.greenhouse.repository.OrderDetailsRepository;
import com.greenhouse.repository.OrderStatusHistoryRepository;
import com.greenhouse.repository.OrdersRepository;
import com.greenhouse.repository.PaymentStatusRepository;
import com.greenhouse.repository.ProductDetailRepository;
import com.greenhouse.repository.ProductDiscountRepository;
import com.greenhouse.repository.Product_FlashSaleRepository;
import com.greenhouse.repository.UserVoucherRepository;
import com.greenhouse.repository.VouchersRepository;

@Service
public class CheckoutService {

    @Autowired
    private OrdersRepository ordersRepository;
    @Autowired
    private OrderStatusHistoryRepository orderStatusHistoryRepository;
    @Autowired
    private OrderDetailsRepository orderDetailsRepository;
    @Autowired
    private InvoicesRepository invoicesRepository;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private InvoiceMappingStatusRepository invoiceMappingStatusRepository;
    @Autowired
    private InvoiceMappingVoucherRepository invoiceMappingVoucherRepository;
    @Autowired
    private PaymentStatusRepository paymentStatusRepository;
    @Autowired
    private InvoiceDetailsRepository invoiceDetailsRepository;
    @Autowired
    private ProductDetailRepository productDetailsRepository;
    @Autowired
    private UserVoucherRepository userVoucherRepository;
    @Autowired
    private CartsRepository cartsRepository;
    @Autowired
    private ProductDiscountRepository productDiscountRepository;
    @Autowired
    private DiscountsRepository discountsRepository;
    @Autowired
    private VouchersRepository vouchersRepository;
    @Autowired
    private FlashSalesRepository flashSalesRepository;
    @Autowired
    private Product_FlashSaleRepository product_FlashSaleRepository;

    // ================================================================================================
    public Invoices createInvoice(CheckoutDTO data) {
        Accounts username = accountRepository.findById(data.getUsername()).orElse(null);
        Invoices invoices = new Invoices();
        invoices.setAccount(username);
        invoices.setCreateDate(new Date());
        invoices.setQuantity(data.getCarts().size());
        invoices.setTotalAmount(data.getTotal_amount());
        invoices.setPaymentAmount(data.getPayment_total());
        invoices.setPaymentMethod(data.getPayment_method());
        invoicesRepository.save(invoices);
        return invoices;
    }

    public void createInvoiceStatusMapping(Invoices invoices, int status) {
        InvoiceMappingStatus iMappingStatus = new InvoiceMappingStatus();
        iMappingStatus.setInvoice(invoices);
        iMappingStatus.setPaymentStatus(paymentStatusRepository.findById(status).orElse(null));
        iMappingStatus.setUpdateAt(new Date());
        invoiceMappingStatusRepository.save(iMappingStatus);
    }

    public void createInvoiceDetailsAndOrderDetails(List<Carts> listCarts, Invoices invoices, Orders order) {
        for (Carts item : listCarts) {
            InvoiceDetails invoiceDetails = new InvoiceDetails();
            invoiceDetails.setInvoice(invoices);
            invoiceDetails.setProductDetail(item.getProductDetail());
            invoiceDetails.setQuantity(item.getQuantity());
            invoiceDetails.setPrice(item.getPrice());
            invoiceDetails.setPriceDiscount(item.getPriceDiscount());
            invoiceDetails.setAmount(item.getAmount());
            invoiceDetailsRepository.save(invoiceDetails);

            OrderDetails orderDetails = new OrderDetails();
            orderDetails.setOrderCode(order.getOrderCode());
            orderDetails.setProductDetailId(item.getProductDetail().getProductDetailId());
            orderDetails.setProductName(item.getProductDetail().getProduct().getProductName());
            orderDetails.setPrice(Double.valueOf(item.getPriceDiscount()).intValue());
            orderDetails.setQuantity(item.getQuantity());
            orderDetails.setWeight(Double.valueOf(item.getProductDetail().getWeight() * item.getQuantity()).intValue());
            orderDetails.setWidth(Double.valueOf(item.getProductDetail().getWidth()).intValue());
            orderDetails.setLength(Double.valueOf(item.getProductDetail().getLength()).intValue());
            orderDetails.setHeight(Double.valueOf(item.getProductDetail().getHeight()).intValue());
            orderDetailsRepository.save(orderDetails);
        }
    }

    // ================================================================================================
    public Orders createOrder(CheckoutDTO data, Invoices invoice) {
        Orders orders = new Orders();

        String orderCode = generateOrderCode();
        while (ordersRepository.existsById(orderCode)) {
            orderCode = generateOrderCode();
        }

        orders.setOrderCode(orderCode);
        orders.setClientOrderCode(orderCode);
        orders.setUsername(data.getUsername());
        orders.setInvoiceId(invoice.getInvoiceId());

        // Thông tin người gửi từ OrderInfo
        orders.setFromName(OrderInfo.FROM_NAME);
        orders.setFromPhone(OrderInfo.FROM_PHONE);
        orders.setFromAddress(OrderInfo.FROM_ADDRESS);
        orders.setFromWardName(OrderInfo.FROM_WARD_NAME);
        orders.setFromDistrictName(OrderInfo.FROM_DISTRICT_NAME);
        orders.setFromProvinceName(OrderInfo.FROM_PROVINCE_NAME);

        // Thông tin người nhận
        orders.setToName(data.getTo_name());
        orders.setToPhone(data.getTo_phone());
        orders.setToAddress(data.getTo_address());
        orders.setToWardCode(data.getTo_ward_code());
        orders.setToDistrictId(data.getTo_district_id());

        // Thông tin dịch vụ GHN
        orders.setServiceId(data.getService_id());
        orders.setServiceTypeId(data.getService_type_id());
        orders.setRequiredNote(OrderInfo.REQUIRED_NOTE);

        // Thông tin đơn hàng
        // trạng thái
        orders.setStatus("pending_confirmation");
        // ngày tạo
        Date now = new Date();
        orders.setCreate_Date(now);
        // cân nặng
        int weight = 0;
        for (Carts item : data.getCarts()) {
            weight += item.getQuantity() * item.getProductDetail().getWeight();
        }
        orders.setWeight(weight);
        // giá trị tổng thể để có gì GHN bồi thường nếu hàng bị gì đó
        int insuranceValue = data.getPayment_total().intValue();
        orders.setInsuranceValue(insuranceValue);
        // xem ai là người trả tiền ship
        if (data.getShipping_fee() == 0) {
            orders.setPaymentTypeId(1);// cửa hàng trả
        } else {
            orders.setPaymentTypeId(2);// khách trả
            orders.setCodAmount(data.getShipping_fee().intValue());
        }
        // Nội dung đơn hàng
        StringBuilder content = new StringBuilder("");
        for (Carts cartItem : data.getCarts()) {
            Products product = cartItem.getProductDetail().getProduct();
            NumberStyleFormatter numberFormatter = new NumberStyleFormatter("#,###");
            content.append("\r\n").append(product.getProductName()).append(",")
                    .append(cartItem.getQuantity()).append("x")
                    .append(numberFormatter.print(cartItem.getPrice(), Locale.getDefault()))
                    .append(" VND,")
                    .append(numberFormatter.print(cartItem.getAmount(), Locale.getDefault()))
                    .append(" VND");
        }

        orders.setContentOrder(content.toString());
        ordersRepository.save(orders);
        return orders;
    }

    public void createOrderStatusHistory(String orderCode, String status) {
        Order_Status_History orderStatusHistory = new Order_Status_History();
        orderStatusHistory.setOrderCode(orderCode);
        orderStatusHistory.setUpdateAt(new Date());
        orderStatusHistory.setStatus(status);
        orderStatusHistoryRepository.save(orderStatusHistory);
    }

    // ================================================================================================
    public void subtractProductQuantity(List<Carts> listCarts) {
        Date currentDate = new Date();

        for (Carts item : listCarts) {
            Product_Detail pDetail = item.getProductDetail();
            pDetail.setQuantityInStock(pDetail.getQuantityInStock() - item.getQuantity());
            productDetailsRepository.save(pDetail);
            // ============================================================================================
            Optional<Flash_Sales> flashSalesOptional = Optional.ofNullable(flashSalesRepository.findByStatus(2));
            List<Product_Flash_Sale> pfs = flashSalesOptional
                    .map(flashSales -> product_FlashSaleRepository.findByFlashSaleId(flashSales))
                    .orElse(new ArrayList<>());
            // ----------------------------------------------------------------
            boolean isFlashSales = false;
            for (Product_Flash_Sale pf : pfs) {
                if (pf.getProductDetail().getProductDetailId() == item.getProductDetail().getProductDetailId()) {
                    int remainingQuantity = pf.getQuantity() - pf.getUsedQuantity();
                    int quantity = item.getQuantity();
                    if (quantity <= remainingQuantity) {
                        updateUsedQuantityForFlashSale(pDetail, item.getQuantity());
                        isFlashSales = true;
                    }
                }
            }
            // ---------------------------------------------------------
            if (!isFlashSales) {
                List<Discounts> discountList = discountsRepository.findActiveDiscountsNowAndActive(new Date(),
                        true);
                for (Discounts d : discountList) {
                    Product_Discount pdDiscount = productDiscountRepository
                            .findByProductDetailAndDiscount(item.getProductDetail(), d);
                    if (pdDiscount != null) {
                        updateUsedQuantityForDiscounts(pDetail, currentDate, item.getQuantity());
                    }
                }
            }
        }
    }

    private void updateUsedQuantityForFlashSale(Product_Detail pDetail, int quantity) {
        Optional<Flash_Sales> flashSalesOptional = Optional.ofNullable(flashSalesRepository.findByStatus(2));

        flashSalesOptional.ifPresent(flashSales -> {
            List<Product_Flash_Sale> pfs = product_FlashSaleRepository.findByFlashSaleId(flashSales);

            pfs.stream()
                    .filter(pf -> pDetail.getProductDetailId() == pf.getProductDetail().getProductDetailId())
                    .findFirst()
                    .ifPresent(pf -> {
                        pf.setUsedQuantity(pf.getUsedQuantity() + quantity);
                        product_FlashSaleRepository.save(pf);
                    });
        });
    }

    private void updateUsedQuantityForDiscounts(Product_Detail pDetail, Date currentDate, int quantity) {
        List<Discounts> discounts = discountsRepository.findActiveDiscountsNowAndActive(currentDate, true);

        discounts.forEach(discount -> {
            Optional<Product_Discount> productDiscountOptional = Optional.ofNullable(
                    productDiscountRepository.findByProductDetailAndDiscount(pDetail, discount));
            productDiscountOptional
                    .ifPresent(productDiscount -> {
                        discount.setUsedQuantity(discount.getUsedQuantity() + quantity);
                        if (discount.getUsedQuantity() >= discount.getQuantity()) {
                            discount.setActive(false);
                        }
                        discountsRepository.save(discount);
                    });
        });
    }

    public void updateCartStatus(List<Carts> listCarts) {
        for (Carts item : listCarts) {
            item.setStatus(false);
            cartsRepository.save(item);
        }
    }

    // ================================================================================================
    public void createInvoiceMappingVoucher(CheckoutDTO data, Invoices invoices, String username) {
        CartVoucherDTO voucherDTO = data.getVoucher();
        if (voucherDTO != null) {
            if (voucherDTO.getNormalVoucherApplied() != null) {
                Vouchers vouchers = voucherDTO.getNormalVoucherApplied();
                Double discount = data.getNormal_discount();
                InvoiceMappingVoucher iMappingVoucher = new InvoiceMappingVoucher();
                iMappingVoucher.setInvoice(invoices);
                iMappingVoucher.setVoucher(vouchers);
                iMappingVoucher.setDiscountAmount(discount);
                invoiceMappingVoucherRepository.save(iMappingVoucher);

                UserVoucher userVoucher = userVoucherRepository.findByUsernameAndVoucherAndStatus(username, vouchers,
                        true);
                if (userVoucher != null) {
                    userVoucher.setStatus(false);
                    userVoucherRepository.save(userVoucher);
                }

                vouchers.setUsedQuantity(vouchers.getUsedQuantity() + 1);
                if (vouchers.getTotalQuantity() - vouchers.getUsedQuantity() <= 0) {
                    vouchers.setStatus(false);

                }
            }
            if (voucherDTO.getShippingVoucherApplied() != null) {
                Vouchers vouchers = voucherDTO.getShippingVoucherApplied();
                Double discount = data.getShipping_fee();
                InvoiceMappingVoucher iMappingVoucher = new InvoiceMappingVoucher();
                iMappingVoucher.setInvoice(invoices);
                iMappingVoucher.setVoucher(vouchers);
                iMappingVoucher.setDiscountAmount(discount);
                invoiceMappingVoucherRepository.save(iMappingVoucher);

                UserVoucher userVoucher = userVoucherRepository.findByUsernameAndVoucherAndStatus(username, vouchers,
                        true);
                userVoucher.setStatus(false);
                vouchers.setUsedQuantity(vouchers.getUsedQuantity() + 1);

                if (vouchers.getTotalQuantity() - vouchers.getUsedQuantity() <= 0) {
                    vouchers.setStatus(false);
                    vouchersRepository.save(vouchers);
                }
            }
        }
    }

    // ================================================================================================
    public boolean validVoucher(CartVoucherDTO voucherDTO) {
        if (voucherDTO != null) {
            Vouchers normalVoucher = voucherDTO.getNormalVoucherApplied();
            Vouchers shippingVoucher = voucherDTO.getShippingVoucherApplied();

            if (normalVoucher != null && !isVoucherValid(normalVoucher)) {
                return false;
            }

            if (shippingVoucher != null && !isVoucherValid(shippingVoucher)) {
                return false;
            }
        }

        return true;
    }

    public boolean isVoucherValid(Vouchers voucher) {
        Date currentDate = new Date();
        int stock = voucher.getTotalQuantity() - voucher.getUsedQuantity();
        if (currentDate.before(voucher.getEndDate()) && currentDate.after(voucher.getStartDate()) && stock > 0) {
            return true;
        } else {
            return false;
        }
    }

    // ================================================================================================

    private String generateOrderCode() {
        String dateFormat = "ddMMyyyy";
        SimpleDateFormat sdf = new SimpleDateFormat(dateFormat);

        String currentDate = sdf.format(new Date());

        int numberLength = 4;

        String randomNumber = generateRandomNumber(numberLength);

        String orderCode = "GH" + currentDate + randomNumber;

        return orderCode;
    }

    private String generateRandomNumber(int length) {
        StringBuilder sb = new StringBuilder();
        Random random = new Random();

        for (int i = 0; i < length; i++) {
            sb.append(random.nextInt(10));
        }

        return sb.toString();
    }

}
