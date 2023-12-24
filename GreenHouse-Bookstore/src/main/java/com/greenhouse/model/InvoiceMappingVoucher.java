package com.greenhouse.model;

import java.io.Serializable;

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
@Table(name = "Invoice_Mapping_Voucher")
public class InvoiceMappingVoucher implements Serializable{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private int id;

    @ManyToOne
    @JoinColumn(name = "Invoice_Id")
    private Invoices invoice;

    @ManyToOne
    @JoinColumn(name = "Voucher_Id")
    private Vouchers voucher;

    @Column(name = "Discount_Amount")
    private double discountAmount;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok hoặc bạn có thể tự viết.

    // Constructor và các phương thức khác
}
