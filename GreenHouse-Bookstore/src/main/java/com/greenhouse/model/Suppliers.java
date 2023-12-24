package com.greenhouse.model;

import lombok.Data;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Data
@Table(name = "Suppliers")
public class Suppliers implements Serializable {

    @Id
    @Column(name = "Supplier_Id", length = 30)
    private String supplierId;

    @Column(name = "Supplier_Name", columnDefinition = "nvarchar(100)", nullable = false)
    private String supplierName;

    @Column(name = "Description", columnDefinition = "nvarchar(300)")
    private String description;

    @Column(name = "Address", columnDefinition = "nvarchar(200)", nullable = false)
    private String address;

    @Column(name = "Email", length = 50, nullable = false)
    private String email;

    @Column(name = "Phone", length = 10, nullable = false)
    private String phone;

    @Column(name = "Image", columnDefinition = "nvarchar(200)")
    private String image;

    // @OneToMany(mappedBy = "supplier")
    // private List<Products> products;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
