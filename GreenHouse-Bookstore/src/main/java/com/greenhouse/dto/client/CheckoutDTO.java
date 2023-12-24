package com.greenhouse.dto.client;

import java.util.List;
import com.greenhouse.model.Carts;
import lombok.Data;

@Data
public class CheckoutDTO { 
    private String username;
    private String to_name;
    private String to_phone;
    private String to_address;
    private String to_ward_code;
    private Integer to_district_id;
    private Integer service_id;
    private Integer service_type_id;
    private List<Carts> carts;
    private Double total_amount; 
    private Double shipping_fee;
    private Double normal_discount;
    private Double payment_total;
    private CartVoucherDTO voucher;
    private String payment_method;
}
