package com.greenhouse.service.impl;

import com.greenhouse.model.Product_Reviews;
import com.greenhouse.repository.ProductReviewsRepository;
import com.greenhouse.service.ProductReviewsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductReviewsServiceImpl implements ProductReviewsService {

    @Autowired
    private ProductReviewsRepository productReviewsRepository;

    @Override
    public List<Product_Reviews> findAll() {
        return productReviewsRepository.findAll();
    }

    @Override
    public Product_Reviews findById(Integer reviewId) {
        Optional<Product_Reviews> result = productReviewsRepository.findById(reviewId);
        return result.orElse(null);
    }

    @Override
    public void add(Product_Reviews productReviews) {
        productReviewsRepository.save(productReviews);
    }

    @Override
    public void update(Product_Reviews productReviews) {
        productReviewsRepository.save(productReviews);
    }

    @Override
    public void delete(Integer reviewId) {
        productReviewsRepository.deleteById(reviewId);
    }
}
