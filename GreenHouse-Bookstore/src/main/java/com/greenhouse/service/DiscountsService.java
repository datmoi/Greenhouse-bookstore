package com.greenhouse.service;

import com.greenhouse.model.Discounts;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

public interface DiscountsService {

    List<Discounts> findAll();

    Discounts findById(Integer discountId);

    Discounts add(Discounts entity);

    Discounts update(Discounts entity);

    void delete(Integer discountId);

    List<Discounts> importDiscounts(MultipartFile file) throws IOException;
}
