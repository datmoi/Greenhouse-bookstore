package com.greenhouse.model;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Payment_Status")
public class PaymentStatus implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Status_Id")
    private int statusId;

    @Column(name = "Name", columnDefinition = "nvarchar(50)")
    private String name;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
