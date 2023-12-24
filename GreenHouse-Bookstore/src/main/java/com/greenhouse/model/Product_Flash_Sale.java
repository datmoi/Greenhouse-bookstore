package com.greenhouse.model;

import java.io.Serializable;

import org.hibernate.annotations.Proxy;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "Product_Flash_Sale")
@Proxy(lazy = false)
public class Product_Flash_Sale implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int id;

    @Column(name = "Quantity")
    private int quantity;

    @Column(name = "Used_Quantity")
    private int usedQuantity;

    @Column(name = "Discount_Percentage")
    private int discountPercentage;

    @Column(name = "Purchase_Limit")
    private int purchaseLimit;

    @ManyToOne
    @JoinColumn(name = "Flash_Sale_Id")
    private Flash_Sales flashSaleId;

    @ManyToOne
    @JoinColumn(name = "Product_Detail_Id")
    private Product_Detail productDetail;
    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
