package com.greenhouse.model;

import lombok.Data;

import jakarta.persistence.*;

@Data
@Entity
@Table(name = "Voucher_Mapping_Category")
public class VoucherMappingCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int id;

    @Column(name = "Voucher_Id")
    private int voucherId;

    @Column(name = "Category_Id")
    private String categoryId;

}
