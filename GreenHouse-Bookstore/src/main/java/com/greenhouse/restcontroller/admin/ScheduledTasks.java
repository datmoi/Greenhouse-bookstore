package com.greenhouse.restcontroller.admin;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.greenhouse.model.Discounts;
import com.greenhouse.model.Flash_Sales;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Product_Discount;
import com.greenhouse.model.Product_Flash_Sale;
import com.greenhouse.repository.ProductDetailRepository;
import com.greenhouse.repository.ProductDiscountRepository;
import com.greenhouse.service.FlashSalesService;
import com.greenhouse.service.ProductDetailService;
import com.greenhouse.service.ProductDiscountService;
import com.greenhouse.service.ProductFlashSaleService;

@Component
public class ScheduledTasks {
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    private final ProductDiscountService productDiscountService;
    private final ProductDetailService productDetailService;
    private final ProductFlashSaleService productFlashSaleService;
    private final FlashSalesService flashSalesService;
    private final ProductDetailRepository productDetailReps; // Make sure this line is correct
    private final ProductDiscountRepository productDiscountRepository; // Create

    public ScheduledTasks(
            ProductDiscountService productDiscountService,
            ProductDetailService productDetailService,
            ProductFlashSaleService productFlashSaleService,
            FlashSalesService flashSalesService,
            ProductDetailRepository productDetailReps,
            ProductDiscountRepository productDiscountRepository) {
        this.productDiscountService = productDiscountService;
        this.productDetailService = productDetailService;
        this.productFlashSaleService = productFlashSaleService;
        this.flashSalesService = flashSalesService;
        this.productDetailReps = productDetailReps;
        this.productDiscountRepository = productDiscountRepository;
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void updateExpiredDiscounts() {
        List<Product_Discount> allProductDiscounts = productDiscountService.findAll();

        for (Product_Discount productDiscount : allProductDiscounts) {
            Discounts discount = productDiscount.getDiscount();

            if (discount != null && discount.getEndDate() != null && discount.getEndDate().before(new Date())) {
                Product_Detail productDetail = productDiscount.getProductDetail();

                if (productDetail != null) {
                    productDetail.setPriceDiscount(productDetail.getPrice());
                    productDetailService.update(productDetail);
                }

                productDiscountService.delete(productDiscount);

                messagingTemplate.convertAndSend("/topic/products", "update");
            }
        }
    }

    // bắt đầu
    @Scheduled(cron = "0 30 0,2,4,6,8,10,12,14,16,18,20,22 * * ?")
    public void updateExpiredFlashSales() {
        List<Product_Flash_Sale> allProductFlashSales = productFlashSaleService.findAll();

        for (Product_Flash_Sale productFlashSale : allProductFlashSales) {
            LocalDateTime currentTime = LocalDateTime.now();

            Flash_Sales flashSale = productFlashSale.getFlashSaleId();
            if (flashSale != null) {
                Time startTime = flashSale.getStartTime();

                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");

                if (isSameDay(flashSale.getUserDate(), new Date()) && startTime.toLocalTime().format(formatter)
                        .equalsIgnoreCase(currentTime.toLocalTime().format(formatter))) {
                    Product_Detail productDetail = productFlashSale.getProductDetail();
                    if (productDetail != null) {
                        double exitPriceDiscount = productDetail.getPrice();
                        double discountPercentage = (double) productFlashSale.getDiscountPercentage() / 100;
                        double newPriceDiscount = exitPriceDiscount * (1 - discountPercentage);
                        productDetail.setPriceDiscount(newPriceDiscount);
                        flashSale.setStatus(2);

                    }
                    flashSalesService.update(flashSale);
                    productDetailService.update(productDetail);
                    productFlashSaleService.update(productFlashSale);
                    messagingTemplate.convertAndSend("/topic/products", "update");
                }
            }

        }
    }

    // kết thúc
    @Scheduled(cron = "0 0 2,4,6,8,10,12,14,16,18,20,22 * * ?")
    public void updateExpiredFlashSales1() {
        List<Product_Flash_Sale> allProductFlashSales = productFlashSaleService.findAll();
        List<Product_Discount> currentDayDiscounts = productDiscountRepository.findProductDiscountsByDate();

        for (Product_Flash_Sale productFlashSale : allProductFlashSales) {
            LocalDateTime currentTime = LocalDateTime.now();
            Flash_Sales flashSale = productFlashSale.getFlashSaleId();

            if (flashSale != null) {
                Time endTime = flashSale.getEndTime();
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");

                if (isSameDay(flashSale.getUserDate(), new Date()) && endTime.toLocalTime().format(formatter)
                        .equalsIgnoreCase(currentTime.toLocalTime().format(formatter))) {
                    Product_Detail productDetail = productFlashSale.getProductDetail();

                    if (productDetail != null) {
                        // Kiểm tra xem sản phẩm có trong danh sách discount không
                        boolean hasDiscount = currentDayDiscounts.stream()
                                .anyMatch(discount -> discount.getProductDetail().getProductDetailId() == productDetail
                                        .getProductDetailId());

                        if (hasDiscount) {
                            // Có discount, gọi hàm updatePriceDiscount
                            productDetailReps.updatePriceDiscount();
                        } else {
                            // Không có discount, set về giá gốc
                            productDetail.setPriceDiscount(productDetail.getPrice());
                            productDetailService.update(productDetail);
                        }
                    }

                    flashSale.setStatus(3);

                }
            }
            flashSalesService.update(flashSale);
            productFlashSaleService.update(productFlashSale);
            messagingTemplate.convertAndSend("/topic/products", "update");
        }
    }

    // Kết thúc lúc 23:59
    @Scheduled(cron = "0 59 23 * * ?")
    public void updateExpiredFlashSales23() {
        updateExpiredFlashSales1();
    }

    private boolean isSameDay(Date date1, Date date2) {
        Calendar cal1 = Calendar.getInstance();
        cal1.setTime(date1);

        Calendar cal2 = Calendar.getInstance();
        cal2.setTime(date2);

        return cal1.get(Calendar.YEAR) == cal2.get(Calendar.YEAR) &&
                cal1.get(Calendar.MONTH) == cal2.get(Calendar.MONTH) &&
                cal1.get(Calendar.DAY_OF_MONTH) == cal2.get(Calendar.DAY_OF_MONTH);
    }
}
