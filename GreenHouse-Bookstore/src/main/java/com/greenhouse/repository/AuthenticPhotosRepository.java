package com.greenhouse.repository;

import com.greenhouse.model.Authentic_Photos;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthenticPhotosRepository extends JpaRepository<Authentic_Photos, Integer> {
    // Các phương thức tùy chỉnh có thể được thêm vào đây nếu cần
    List<Authentic_Photos> findByProductReview_ReviewId(int reviewId);

}
