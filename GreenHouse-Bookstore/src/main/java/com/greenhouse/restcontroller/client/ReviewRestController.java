package com.greenhouse.restcontroller.client;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.model.Accounts;
import com.greenhouse.model.Authentic_Photos;
import com.greenhouse.model.Notification;
import com.greenhouse.model.Product_Reviews;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.AuthenticPhotosRepository;
import com.greenhouse.repository.BookAuthorsRepository;
import com.greenhouse.repository.ProductReviewsRepository;
import com.greenhouse.repository.Product_ImagesRepository;

import jakarta.transaction.Transactional;

@CrossOrigin("*")
@RestController
@RequestMapping("/customer")
public class ReviewRestController {

    @Autowired
    private ProductReviewsRepository productReviewsRepository;

    @GetMapping("/rest/review/{username}")
    public ResponseEntity<List<Product_Reviews>> getReview(@PathVariable String username) {
        List<Product_Reviews> productReviews = productReviewsRepository.findByAccountUsername(username);
        return ResponseEntity.ok(productReviews);
    }

    @GetMapping("/rest/reviewdetail/{reviewId}")
    public Product_Reviews getReview(@PathVariable Integer reviewId) {
        Product_Reviews review = productReviewsRepository.findByReviewId(reviewId);
        return review;

    }

}
