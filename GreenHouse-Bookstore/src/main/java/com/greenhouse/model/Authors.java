package com.greenhouse.model;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Authors")
public class Authors implements Serializable {

    @Id
    @Column(name = "Author_Id")
    private String authorId;

    @Column(name = "Author_Name")
    private String authorName;

    @Column(name = "Gender")
    private Boolean gender;

    @Column(name = "Nation")
    private String nation;

    @Column(name = "image")
    private String image;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
