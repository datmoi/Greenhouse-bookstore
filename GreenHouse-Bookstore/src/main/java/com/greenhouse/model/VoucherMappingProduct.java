package com.greenhouse.model;

import lombok.Data;
import jakarta.persistence.*;

@Entity
@Data
@Table(name = "Voucher_Mapping_Product")
public class VoucherMappingProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private int Id;

    @Column(name = "Voucher_Id")
    private int voucherId;

    @Column(name = "Product_Detail_Id", length = 30)
    private int productDetailId;

}
