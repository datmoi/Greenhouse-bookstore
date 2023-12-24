package com.greenhouse.model;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.Data;
@Entity
@Data
@Table(name = "Address")
public class Address implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private int id;

    @Column(name = "Address")
    private String address;

    @Column(name = "Username")
    private String username;

    @Column(name = "Phone")
    private String phone;

    @Column(name = "Fullname")
    private String fullname;

    @ManyToOne
    @JoinColumn(name = "Username", referencedColumnName = "Username", insertable = false, updatable = false)
    private Accounts account;

    // Getters and setters
}
