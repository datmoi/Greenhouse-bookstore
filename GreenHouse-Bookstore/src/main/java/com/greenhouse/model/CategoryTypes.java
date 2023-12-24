package com.greenhouse.model;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Category_Types")
public class CategoryTypes implements Serializable {

    @Id
    @Column(name = "Type_Id")
    private String typeId;

    @Column(name = "Type_Name")
    private String typeName;

    @Column(name = "Description")
    private String description;

    @Column(name = "Parent_Categories_Type")
    private String parentCategoriesType;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
