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
@Table(name = "Product_Detail")
@Proxy(lazy = false)
public class Product_Detail implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Product_Detail_Id")
    private int productDetailId;

    @ManyToOne
    @JoinColumn(name = "Product_Id")
    private Products product;

    @Column(name = "Price")
    private double price;

    @Column(name = "Price_discount")
    private double priceDiscount;

    @Column(name = "Quantity_In_Stock")
    private int quantityInStock;

    @Column(name = "Weight")
    private float weight;

    @Column(name = "Length")
    private float length;

    @Column(name = "Width")
    private float width;

    @Column(name = "Height")
    private float height;

    @Column(name = "Image")
    private String image;
    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
