package com.greenhouse.model;

import java.util.Date;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Order_Status_History")
public class Order_Status_History {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private int id;

    @Column(name = "Order_Code", length = 50)
    private String orderCode;

    @Column(name = "Update_At")
    @Temporal(TemporalType.TIMESTAMP)
    private Date updateAt;

    @Column(name = "Status", length = 50)
    private String status;

    @ManyToOne
    @JoinColumn(name = "Order_Code", referencedColumnName = "Order_Code", insertable = false, updatable = false)
    private Orders order;

}