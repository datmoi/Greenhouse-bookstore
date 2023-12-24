package com.greenhouse.model;

import java.io.Serializable;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "Publishers")
public class Publishers implements Serializable {

  @Id
  @Column(name = "Publisher_Id", length = 30, nullable = false)
  private String publisherId;

  @Column(name = "Publisher_Name", length = 100, nullable = false)
  private String publisherName;

  @Column(name = "Description", length = 200)
  private String description;

  @Column(name = "Address", length = 200, nullable = false)
  private String address;

  @Column(name = "Email", length = 50, nullable = false)
  private String email;

  @Column(name = "Image", length = 200)
  private String image;
  // Các phương thức getters và setters đã được tự động tạo bởi Lombok.
}
