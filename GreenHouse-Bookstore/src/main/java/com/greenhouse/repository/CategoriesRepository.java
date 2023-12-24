package com.greenhouse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.greenhouse.model.Categories;

public interface CategoriesRepository extends JpaRepository<Categories, String> {

    List<Categories> findByTypeId_TypeId(String typeId);

}
