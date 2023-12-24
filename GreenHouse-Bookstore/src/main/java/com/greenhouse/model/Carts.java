package com.greenhouse.model;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Carts")
public class Carts implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Cart_Id")
    private int cartId;

    @Column(name = "Quantity")
    private int quantity;

    @Column(name = "Price")
    private double price;

    @Column(name = "Amount")
    private double amount;

    @Column(name = "Price_discount")
    private double priceDiscount;

    @Column(name = "Status")
    private boolean status;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.

    @ManyToOne
    @JoinColumn(name = "Username", referencedColumnName = "Username")
    private Accounts account;

    @ManyToOne
    @JoinColumn(name = "Product_Detail_Id", referencedColumnName = "Product_Detail_Id")
    private Product_Detail productDetail;
}
