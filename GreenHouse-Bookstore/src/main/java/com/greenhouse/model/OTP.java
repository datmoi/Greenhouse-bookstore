package com.greenhouse.model;

import java.io.Serializable;
import java.util.Date;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "OTP")
public class OTP implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int id;

    @ManyToOne
    @JoinColumn(name = "Username")
    private Accounts username;

    @Column(name = "OTP_Code", columnDefinition = "varchar(8)")
    private String otpCode;

    @Column(name = "Create_Time")
    private Date createTime;

    @Column(name = "Expired_Time")
    private Date expiredTime;

    @Column(name = "Status")
    private int status;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
