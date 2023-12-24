package com.greenhouse.model;


import java.io.Serializable;

import org.hibernate.annotations.Proxy;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Attribute_Value")
@Proxy(lazy = false)
public class Attribute_Value implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int id;

    @ManyToOne
    @JoinColumn(name = "Attribute_Id")
    private ProductAttributes attribute;

    @ManyToOne
    @JoinColumn(name = "Product_Detail_Id")
    private Product_Detail productDetail;

    @Column(name = "Value")
    private String value;

    // Getters and setters
}
