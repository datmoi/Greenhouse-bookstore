package com.greenhouse.model;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Book_Authors")
public class Book_Authors implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private int id;

    @ManyToOne
    @JoinColumn(name = "Author_Id", referencedColumnName = "Author_Id")
    private Authors author;

    @ManyToOne
    @JoinColumn(name = "Product_Id", referencedColumnName = "Product_Id")
    private Products product;

    // Các phương thức getters và setters đã được tự động tạo bởi Lombok.

    // Mối quan hệ nếu cần
}
