package com.greenhouse.model;

import java.io.Serializable;
import java.sql.Time;
import java.util.Date;
import java.util.List;

import org.hibernate.annotations.Proxy;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "Flash_Sales")
@Proxy(lazy = false)
public class Flash_Sales implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Flash_Sale_Id")
    private int flashSaleId;

    @Column(name = "Name")
    private String name;

    @Column(name = "Start_Time")
    private Time startTime;

    @Column(name = "End_Time")
    private Time endTime;

    @Column(name = "User_Date")
    private Date userDate;

    @Column(name = "Status")
    private int status;

}
