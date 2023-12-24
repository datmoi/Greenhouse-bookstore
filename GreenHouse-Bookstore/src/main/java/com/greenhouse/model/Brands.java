package com.greenhouse.model;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Brands")
public class Brands implements Serializable {

    @Id
    @Column(name = "Brand_Id")
    private String brandId;

    @Column(name = "Brand_Name")
    private String brandName;

    @Column(name = "Country_Of_Origin")
    private String countryOfOrigin;

    @Column(name = "Logo")
    private String logo;

    // Mối quan hệ nếu cần
}
