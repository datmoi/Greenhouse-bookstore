package com.greenhouse.service.impl;

import com.greenhouse.model.Product_Flash_Sale;
import com.greenhouse.repository.Product_FlashSaleRepository;
import com.greenhouse.service.ProductFlashSaleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductFlashSaleServiceImpl implements ProductFlashSaleService {

    @Autowired
    private Product_FlashSaleRepository productFlashSaleRepository;

    @Override
    public List<Product_Flash_Sale> findAll() {
        return productFlashSaleRepository.findAll();
    }

    @Override
    public Product_Flash_Sale findById(Integer id) {
        Optional<Product_Flash_Sale> result = productFlashSaleRepository.findById(id);
        return result.orElse(null);
    }

    @Override
    public void add(Product_Flash_Sale productFlashSale) {
        productFlashSaleRepository.save(productFlashSale);
    }

    @Override
    public void update(Product_Flash_Sale productFlashSale) {
        productFlashSaleRepository.save(productFlashSale);
    }

    @Override
    public void delete(Integer id) {
        productFlashSaleRepository.deleteById(id);
    }

    @Override
    public List<Product_Flash_Sale> findByProductFSId(Integer flashSale) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'findByProductFSId'");
    }


}
