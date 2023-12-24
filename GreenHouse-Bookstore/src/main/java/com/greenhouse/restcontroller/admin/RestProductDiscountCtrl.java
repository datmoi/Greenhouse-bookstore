package com.greenhouse.restcontroller.admin;

import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Product_Discount;
import com.greenhouse.service.ProductDetailService;
import com.greenhouse.service.ProductDiscountService;
import com.greenhouse.dto.ProductDiscountRequest;
import com.greenhouse.model.Discounts;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/rest/product_discount")
public class RestProductDiscountCtrl {

    @Autowired
    private ProductDiscountService productDiscountService;

    @Autowired
    private ProductDetailService productDetailService;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<Product_Discount>> getAllProductDiscounts() {
        List<Product_Discount> productDiscounts = productDiscountService.findAll();
        return new ResponseEntity<>(productDiscounts, HttpStatus.OK);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<Product_Discount> getOne(@PathVariable("id") int id) {
        Product_Discount productDiscount = productDiscountService.findById(id);
        if (productDiscount == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(productDiscount, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody ProductDiscountRequest productDiscountRequest) {
        // Kiểm tra xem Discounts có tồn tại không
        Discounts discount = productDiscountRequest.getDiscount();
        if (discount == null) {
            return new ResponseEntity<>("Discounts không tồn tại.", HttpStatus.BAD_REQUEST);
        }

        // Xử lý danh sách sản phẩm được chọn
        List<Product_Detail> selectedProductDetails = productDiscountRequest.getProductDetails();
        if (selectedProductDetails == null || selectedProductDetails.isEmpty()) {
            return new ResponseEntity<>("Danh sách sản phẩm không được để trống.", HttpStatus.BAD_REQUEST);
        }

        for (Product_Detail selectedProductDetail : selectedProductDetails) {
            double productPrice = selectedProductDetail.getPrice();
            double valueDiscount = ((double) discount.getValue()) / 100;

            double priceDiscount = productPrice - (productPrice * valueDiscount);
            selectedProductDetail.setPriceDiscount(priceDiscount);
            // Thêm Product_Detail vào service
            productDetailService.add(selectedProductDetail);

            // Tạo Product_Discount và thêm vào service nếu cần
            Product_Discount productDiscount = new Product_Discount();
            productDiscount.setDiscount(discount);
            productDiscount.setProductDetail(selectedProductDetail);
            productDiscountService.add(productDiscount);
            // Sau khi tạo sản phẩm thành công, gửi thông báo đến client sử dụng WebSocket
            messagingTemplate.convertAndSend("/topic/products", "update");
        }

        return new ResponseEntity<>("Chiến dịch giảm giá đã được tạo thành công.", HttpStatus.OK);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") int id) {
        Product_Discount existingProductDiscount = productDiscountService.findById(id);
        if (existingProductDiscount == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Lấy Product_Detail từ existingProductDiscount
        Product_Detail productDetail = existingProductDiscount.getProductDetail();

        // Gán priceDiscount bằng giá gốc (price)
        productDetail.setPriceDiscount(productDetail.getPrice());

        // Cập nhật Product_Detail
        productDetailService.update(productDetail);

        // Xóa Product_Discount
        productDiscountService.delete(id);
        // Sau khi tạo sản phẩm thành công, gửi thông báo đến client sử dụng WebSocket
        messagingTemplate.convertAndSend("/topic/products", "update");

        return new ResponseEntity<>(HttpStatus.OK);
    }

}
