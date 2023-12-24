package com.greenhouse.model;

import lombok.Data;
import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Data
@Table(name = "Roles")
public class Roles implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Role_Id")
    private int roleId;

    @Column(name = "Role", columnDefinition = "nvarchar(50)")
    private String role;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
