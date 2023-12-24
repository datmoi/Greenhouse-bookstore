package com.greenhouse.service;

import com.greenhouse.model.ProductPriceHistories;
import com.greenhouse.model.Product_Detail;

import java.util.List;

public interface ProductPriceHistoriesService {

    List<ProductPriceHistories> findAll();

    ProductPriceHistories findById(Integer priceHistoriesId);

    ProductPriceHistories add(ProductPriceHistories entity);

    ProductPriceHistories update(ProductPriceHistories entity);

    void delete(Integer priceHistoriesId);

    ProductPriceHistories findByProductDetail(Product_Detail existingProductDetail);
}
