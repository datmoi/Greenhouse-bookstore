package com.greenhouse.model;

import java.io.Serializable;
import java.util.Date;

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
@Table(name = "Product_Reviews")
public class Product_Reviews implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Review_Id")
    private int reviewId;

    @ManyToOne
    @JoinColumn(name = "Username")
    private Accounts account;

    @ManyToOne
    @JoinColumn(name = "Product_Detail_Id")
    private Product_Detail productDetail;

    @Column(name = "Comment")
    private String comment;

    @Column(name = "Date")
    private Date date;

    @Column(name = "Star")
    private int star;

    @ManyToOne
    @JoinColumn(name = "Order_Code")
    private Orders order;
    // Constructors, getters, and setters.
}
