package com.greenhouse.model;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Order_Detail")
public class OrderDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private int id;

    @Column(name = "Order_Code")
    private String orderCode;

    @Column(name = "Product_Detail_Id")
    private int productDetailId;

    @Column(name = "Product_Name")
    private String productName;

    @Column(name = "Price")
    private double price;

    @Column(name = "Quantity")
    private int quantity;

    @Column(name = "Weight")
    private double weight;

    @Column(name = "Width")
    private double width;

    @Column(name = "Height")
    private double height;

    @Column(name = "Length")
    private double length;

    @ManyToOne
    @JoinColumn(name = "Order_Code", referencedColumnName = "Order_Code", insertable = false, updatable = false)
    private Orders order;

    @ManyToOne
    @JoinColumn(name = "Product_Detail_Id",referencedColumnName="Product_Detail_Id", insertable = false, updatable = false)
    private Product_Detail productDetail;
}

