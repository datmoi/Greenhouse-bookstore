package com.greenhouse.model;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Invoice_Details")
public class InvoiceDetails implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Invoice_Detail_Id")
    private int invoiceDetailId;

    @ManyToOne
    @JoinColumn(name = "Invoice_Id")
    private Invoices invoice;

    @ManyToOne
    @JoinColumn(name = "Product_Detail_Id")
    private Product_Detail productDetail;

    @Column(name = "Quantity")
    private int quantity;

    @Column(name = "Price")
    private double price;

    @Column(name = "Price_Discount")
    private double priceDiscount;
    
    @Column(name = "Amount")
    private double amount;

}
