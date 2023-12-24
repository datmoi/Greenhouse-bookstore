package com.greenhouse.model;

import lombok.Data;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Data
@Table(name = "User_Voucher")
public class UserVoucher implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private int id;

    @Column(name = "Username", length = 50)
    private String username;

    @ManyToOne
    @JoinColumn(name = "Voucher_Id")
    private Vouchers voucher;

    @Column(name = "Status")
    private Boolean status;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
