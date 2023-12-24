package com.greenhouse.model;

import java.io.Serializable;
import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import lombok.Data;

@Entity
@Data
@Table(name = "Accounts")
public class Accounts implements Serializable{

    @Id
    @Column(name = "Username")
    private String username;

    @Column(name = "Password")
    private String password;

    @Column(name = "Fullname")
    private String fullname;

    @Column(name = "Email")
    private String email;

    @Column(name = "Gender")
    private Boolean gender;

    @Column(name = "Birthday")
    @Temporal(TemporalType.DATE)
    private Date birthday;

    @Column(name = "Phone")
    private String phone;

    @Column(name = "Image")
    private String image;

    @Column(name = "Create_At")
    private Date createdAt;

    @Column(name = "Deleted_At")
    private Date deletedAt;

    @Column(name = "Deleted_By")
    private String deletedBy;

    @Column(name = "Active")
    private Boolean active;
   
    // Getters and setters
}
