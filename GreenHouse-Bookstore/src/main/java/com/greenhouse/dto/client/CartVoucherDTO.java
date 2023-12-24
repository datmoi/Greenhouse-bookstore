package com.greenhouse.dto.client;

import com.greenhouse.model.Vouchers;

import lombok.Data;

@Data
public class CartVoucherDTO {
    private Vouchers normalVoucherApplied;
    private Vouchers shippingVoucherApplied;
}
