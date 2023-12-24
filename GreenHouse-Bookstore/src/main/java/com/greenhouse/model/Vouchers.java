package com.greenhouse.model;

import lombok.Data;
import jakarta.persistence.*;
import java.io.Serializable;
import java.util.Date;
@Entity
@Data
@Table(name = "Vouchers")
public class Vouchers implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Voucher_Id")
    private int voucherId;

    @Column(name = " Voucher_Name")
    private String voucherName;

    @Column(name = "Code", length = 100)
    private String code;

    @Column(name = " Voucher_Type")
    private String voucherType;

    @Column(name = "Discount_Type", columnDefinition = "nvarchar(200)")
    private String discountType;

    @Column(name = "Discount_Amount")
    private Double discountAmount;

    @Column(name = "Discount_Percentage")
    private int discountPercentage;

    @Column(name = "Minimum_Purchase_Amount")
    private Double minimumPurchaseAmount;

    @Column(name = "Maximum_Discount_Amount")
    private Double maximumDiscountAmount;

    @Column(name = "Start_Date")
    private Date startDate;

    @Column(name = "End_Date")
    private Date endDate;

    @Column(name = "Total_Quantity")
    private int totalQuantity;

    @Column(name = "Used_Quantity")
    private int usedQuantity;

    @Column(name = "Status")
    private boolean status;

    @Column(name = "Description")
    private String description;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
