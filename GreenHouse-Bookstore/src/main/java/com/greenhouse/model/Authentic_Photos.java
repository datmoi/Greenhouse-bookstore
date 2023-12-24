package com.greenhouse.model;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "Authentic_Photos")
@Data
public class Authentic_Photos implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Authentic_Photo_Id")
    private int authenticPhotoId;

    @Column(name = "Photo_Name")
    private String photoName;

    @Column(name = "Product_Review_Id")
    private int productReviewId;

    @ManyToOne
    @JoinColumn(name = "Product_Review_Id", referencedColumnName = "Review_Id", insertable = false, updatable = false)
    private Product_Reviews productReview;

    // Getters and setters
}
