package com.greenhouse.model;

import java.util.Date;

import org.hibernate.annotations.Proxy;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Orders")
@Proxy(lazy = false)
public class Orders {

    @Id
    @Column(name = "Order_Code", length = 50, nullable = false)
    private String orderCode;

    @Column(name = "Order_code_ghn", length = 50, nullable = true)
    private String orderCodeGHN;

    @Column(name = "Username", length = 50, nullable = false)
    private String username;

    @Column(name = "invoice_id", nullable = false)
    private int invoiceId;

    @Column(name = "to_name", length = 1024, nullable = false)
    private String toName;

    @Column(name = "from_name", length = 1024, nullable = false)
    private String fromName;

    @Column(name = "from_phone", length = 20, nullable = false)
    private String fromPhone;

    @Column(name = "from_address", length = 1024, nullable = false)
    private String fromAddress;

    @Column(name = "from_ward_name", length = 255, nullable = false)
    private String fromWardName;

    @Column(name = "from_district_name", length = 255, nullable = false)
    private String fromDistrictName;

    @Column(name = "from_province_name", length = 255, nullable = false)
    private String fromProvinceName;

    @Column(name = "to_phone", length = 20, nullable = false)
    private String toPhone;

    @Column(name = "to_address", length = 1024, nullable = false)
    private String toAddress;

    @Column(name = "to_ward_code", length = 20, nullable = false)
    private String toWardCode;

    @Column(name = "to_district_id", nullable = false)
    private int toDistrictId;

    @Column(name = "return_phone", length = 20)
    private String returnPhone;

    @Column(name = "return_address", length = 1024)
    private String returnAddress;

    @Column(name = "return_district_id")
    private Integer returnDistrictId;

    @Column(name = "return_ward_code", length = 20)
    private String returnWardCode;

    @Column(name = "client_order_code", length = 50)
    private String clientOrderCode;

    @Column(name = "cod_amount", nullable = false)
    private int codAmount;

    @Column(name = "content_order", columnDefinition = "nvarchar(2000)", nullable = false)
    private String contentOrder;

    @Column(name = "weight", nullable = false)
    private int weight;

    @Column(name = "length", nullable = false)
    private int length;

    @Column(name = "width", nullable = false)
    private int width;

    @Column(name = "height", nullable = false)
    private int height;

    @Column(name = "pick_station_id")
    private Integer pickStationId;

    @Column(name = "insurance_value", nullable = false)
    private int insuranceValue;

    @Column(name = "service_id")
    private Integer serviceId;

    @Column(name = "service_type_id", nullable = false)
    private int serviceTypeId;

    @Column(name = "payment_type_id", nullable = false)
    private int paymentTypeId;

    @Column(name = "note", columnDefinition = "nvarchar(MAX)")
    private String note;

    @Column(name = "required_note", columnDefinition = "nvarchar(500)", nullable = false)
    private String requiredNote;

    @Column(name = "created_date")
    private Date create_Date;

    @Column(name = "expected_delivery_time")
    private Date expected_delivery_time;

    @Column(name = "status")
    private String status;

    @Column(name = "confirmed_by", nullable = true)
    private String confirmed_By;

    @ManyToOne
    @JoinColumn(name = "Username", referencedColumnName = "Username", insertable = false, updatable = false)
    private Accounts account;

    @ManyToOne
    @JoinColumn(name = "invoice_id", referencedColumnName = "invoice_id", insertable = false, updatable = false)
    private Invoices invoices;
}