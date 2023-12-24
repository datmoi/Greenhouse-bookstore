package com.greenhouse.service;

import com.greenhouse.model.Categories;

import java.util.List;

public interface CategoriesService {

    List<Categories> findAll();

    Categories findById(String categoryId);

    Categories add(Categories entity);

    Categories update(Categories entity);

    void delete(String categoryId);

    List<Categories> finByTypeId(String typeId);
}
