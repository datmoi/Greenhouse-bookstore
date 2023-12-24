package com.greenhouse.model;

import java.io.Serializable;
import java.util.Date;

import org.hibernate.annotations.Proxy;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Products")
@Proxy(lazy = false)
public class Products implements Serializable {

    @Id
    @Column(name = "Product_Id", length = 30)
    private String productId;
    @Column(name = "Product_Name", length = 100)
    private String productName;
    @Column(name = "Description", length = 200)
    private String description;
    @Column(name = "Manufacture_Date")
    private Date manufactureDate;
    @Column(name = "Status")
    private boolean status;
    @Column(name = "Create_At")
    private Date createAt;
    @Column(name = "Delete_At")
    private Date deleteAt;
    @Column(name = "Delete_By", length = 200)
    private String deleteBy;
    @Column(name = "Update_At")
    private Date updateAt;
    @ManyToOne
    @JoinColumn(name = "Brand_Id")
    private Brands brand;
    @ManyToOne
    @JoinColumn(name = "publisher_id")
    private Publishers publisher;

    // Constructors, getters, and setters
}
