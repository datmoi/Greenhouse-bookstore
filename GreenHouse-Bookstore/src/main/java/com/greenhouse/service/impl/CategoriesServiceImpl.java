package com.greenhouse.service.impl;

import com.greenhouse.model.Categories;
import com.greenhouse.model.CategoryTypes;
import com.greenhouse.repository.CategoriesRepository;
import com.greenhouse.service.CategoriesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoriesServiceImpl implements CategoriesService {

    @Autowired
    private CategoriesRepository categoriesRepository;

    @Override
    public List<Categories> findAll() {
        return categoriesRepository.findAll();
    }

    @Override
    public Categories findById(String categoryId) {
        Optional<Categories> result = categoriesRepository.findById(categoryId);
        return result.orElse(null);
    }

    @Override
    public Categories add(Categories categories) {
        return categoriesRepository.save(categories);
    }

    @Override
    public Categories update(Categories categories) {
        return categoriesRepository.save(categories);
    }

    @Override
    public void delete(String categoryId) {
        categoriesRepository.deleteById(categoryId);
    }


    @Override
    public List<Categories> finByTypeId(String typeId) {
        return categoriesRepository.findByTypeId_TypeId(typeId);
    }

}
