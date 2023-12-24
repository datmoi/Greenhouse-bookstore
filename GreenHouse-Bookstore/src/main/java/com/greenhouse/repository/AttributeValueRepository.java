package com.greenhouse.repository;

import com.greenhouse.model.Attribute_Value;
import com.greenhouse.model.Product_Detail;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AttributeValueRepository extends JpaRepository<Attribute_Value, Integer> {
    List<Attribute_Value> findByProductDetail_ProductDetailId(int productDetailId);
}
