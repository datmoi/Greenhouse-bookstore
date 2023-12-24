package com.greenhouse.model;

import java.io.Serializable;

import org.hibernate.annotations.Proxy;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Product_Category")
@Proxy(lazy = false)
public class Product_Category implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private int id;

    @ManyToOne
    @JoinColumn(name = "Product_Id")
    private Products product;

    @ManyToOne
    @JoinColumn(name = "Category_Id")
    private Categories category;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
