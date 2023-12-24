package com.greenhouse.model;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Categories")
public class Categories implements Serializable {

    @Id
    @Column(name = "Category_Id")
    private String categoryId;

    @Column(name = "Category_Name")
    private String categoryName;

    @ManyToOne
    @JoinColumn(name = "Type_Id", referencedColumnName = "Type_Id")
    private CategoryTypes typeId;
}
