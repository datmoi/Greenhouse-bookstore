package com.greenhouse.restcontroller.admin;

import com.greenhouse.model.Categories;
import com.greenhouse.service.CategoriesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/rest/categories")
public class RestCategoryCtrl {

    @Autowired
    private CategoriesService categoriesService;

    @GetMapping
    public ResponseEntity<List<Categories>> getAllCategories() {
        List<Categories> categories = categoriesService.findAll();
        return new ResponseEntity<>(categories, HttpStatus.OK);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<Categories> getOne(@PathVariable("id") String id) {
        Categories category = categoriesService.findById(id);
        if (category == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody Categories category) {
        if (category.getCategoryId() == null || category.getCategoryId().isEmpty()) {
            return new ResponseEntity<>("Mã danh mục không hợp lệ.", HttpStatus.BAD_REQUEST);
        }

        Categories existingCategory = categoriesService.findById(category.getCategoryId());
        if (existingCategory != null) {
            return new ResponseEntity<>("Danh mục đã tồn tại.", HttpStatus.BAD_REQUEST);
        }

        Categories createdCategory = categoriesService.add(category);
        return new ResponseEntity<>(createdCategory, HttpStatus.OK);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Categories> update(@PathVariable("id") String id, @RequestBody Categories category) {
        Categories existingCategory = categoriesService.findById(id);
        if (existingCategory == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        category.setCategoryId(id); // Đảm bảo tính nhất quán về ID
        categoriesService.update(category);
        return new ResponseEntity<>(category, HttpStatus.OK);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        Categories existingCategory = categoriesService.findById(id);
        if (existingCategory == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        categoriesService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
