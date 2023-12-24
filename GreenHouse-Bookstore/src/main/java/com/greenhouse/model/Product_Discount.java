package com.greenhouse.model;

import java.io.Serializable;

import org.hibernate.annotations.Proxy;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Product_Discount")
@Proxy(lazy = false)
public class Product_Discount implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int id;

    @ManyToOne
    @JoinColumn(name = "Discount_Id")
    private Discounts discount;

    @ManyToOne
    @JoinColumn(name = "Product_Detail_Id")
    private Product_Detail productDetail;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
