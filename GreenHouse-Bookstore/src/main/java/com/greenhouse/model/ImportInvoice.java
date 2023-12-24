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
@Table(name = "Import_Invoice")
public class ImportInvoice implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Import_Invoice_Id")
    private int importInvoiceId;

    @Column(name = "Username")
    private String username;

    @Column(name = "Create_Date")
    private Date createDate;

    @Column(name = "Amount")
    private double amount;

    @Column(name = "Description")
    private String description;

    @Column(name = "Status")
    private boolean status;

    @ManyToOne
    @JoinColumn(name = "Supplier_Id")
    private Suppliers suppliers;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
