package com.greenhouse.model;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Product_Price_Histories")
public class ProductPriceHistories implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Price_Histories_Id")
    private int priceHistoriesId;

    @ManyToOne
    @JoinColumn(name = "Product_Detail_Id")
    private Product_Detail productDetail;

    @Column(name = "Price_Old")
    private double priceOld;

    @Column(name = "Price_New")
    private double priceNew;

    @Column(name = "Time_Change")
    private Date timeChange;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
