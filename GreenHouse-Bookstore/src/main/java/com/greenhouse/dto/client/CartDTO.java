package com.greenhouse.dto.client;

import lombok.Data;

@Data
public class CartDTO {
    private String username;
    private int quantity;
    private int productDetailId;
}
