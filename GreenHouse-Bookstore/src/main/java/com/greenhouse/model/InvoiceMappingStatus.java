package com.greenhouse.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Invoice_Mapping_Status")
public class InvoiceMappingStatus implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Invoice_Order_Status_Id")
    private int invoiceOrderStatusId;

    @ManyToOne
    @JoinColumn(name = "Invoice_Id")
    private Invoices invoice;

    @ManyToOne
    @JoinColumn(name = "Payment_Status_Id")
    private PaymentStatus paymentStatus;

    @Column(name = "Update_At")
    private Date updateAt;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
