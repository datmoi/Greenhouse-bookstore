package com.greenhouse.dto.client;


import com.greenhouse.model.Vouchers;

import lombok.Data;

@Data
public class UserVoucherDTO {
    private String username;
    private Vouchers voucher;
}
