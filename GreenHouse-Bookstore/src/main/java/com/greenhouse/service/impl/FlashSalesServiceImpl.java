package com.greenhouse.service.impl;

import com.greenhouse.model.Flash_Sales;
import com.greenhouse.repository.FlashSalesRepository;
import com.greenhouse.service.FlashSalesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FlashSalesServiceImpl implements FlashSalesService {

    @Autowired
    private FlashSalesRepository flashSalesRepository;

    @Override
    public List<Flash_Sales> findAll() {
        return flashSalesRepository.findAll();
    }

    @Override
    public Flash_Sales findById(Integer flashSaleId) {
        Optional<Flash_Sales> result = flashSalesRepository.findById(flashSaleId);
        return result.orElse(null);
    }

    @Override
    public void add(Flash_Sales flashSales) {
        flashSalesRepository.save(flashSales);
    }

    @Override
    public void update(Flash_Sales flashSales) {
        flashSalesRepository.save(flashSales);
    }

    @Override
    public void delete(Integer flashSaleId) {
        flashSalesRepository.deleteById(flashSaleId);
    }

    @Override
    public List<Object[]> findAllFlashSale() {
        return flashSalesRepository.findAllFlashSale();
    }

    @Override
    public List<Object[]> findProductsByStatus() {
        return flashSalesRepository.findProductsByStatus();
    }

}
