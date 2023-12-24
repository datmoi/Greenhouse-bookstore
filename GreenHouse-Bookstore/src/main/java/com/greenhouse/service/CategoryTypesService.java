package com.greenhouse.service;

import com.greenhouse.model.CategoryTypes;

import java.util.List;

public interface CategoryTypesService {

    List<CategoryTypes> findAll();

    CategoryTypes findById(String typeId);

    CategoryTypes add(CategoryTypes entity);

    CategoryTypes update(CategoryTypes entity);

    void delete(String typeId);
}
