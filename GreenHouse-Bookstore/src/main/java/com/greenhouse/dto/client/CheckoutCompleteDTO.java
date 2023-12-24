package com.greenhouse.dto.client;

import com.greenhouse.model.Invoices;
import com.greenhouse.model.Orders;

import lombok.Data;

@Data
public class CheckoutCompleteDTO {
    private Invoices invoices;
    private Orders orders;
}
