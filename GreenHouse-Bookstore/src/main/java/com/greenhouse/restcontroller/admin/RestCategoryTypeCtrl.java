package com.greenhouse.restcontroller.admin;

import com.greenhouse.model.CategoryTypes;
import com.greenhouse.service.CategoryTypesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/rest/categoryTypes")
public class RestCategoryTypeCtrl {

    @Autowired
    private CategoryTypesService categoryTypesService;

    @GetMapping
    public ResponseEntity<List<CategoryTypes>> getAllCategoryTypes() {
        List<CategoryTypes> categoryTypes = categoryTypesService.findAll();
        return new ResponseEntity<>(categoryTypes, HttpStatus.OK);
    }

    @GetMapping(value = "/{id}")
    public ResponseEntity<CategoryTypes> getOne(@PathVariable("id") String id) {
        CategoryTypes categoryType = categoryTypesService.findById(id);
        if (categoryType == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(categoryType, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestBody CategoryTypes categoryType) {
        if (categoryType.getTypeId() == null || categoryType.getTypeId().isEmpty()) {
            return new ResponseEntity<>("Mã loại danh mục không hợp lệ.", HttpStatus.BAD_REQUEST);
        }

        CategoryTypes existingCategoryType = categoryTypesService.findById(categoryType.getTypeId());
        if (existingCategoryType != null) {
            return new ResponseEntity<>("Loại danh mục đã tồn tại.", HttpStatus.BAD_REQUEST);
        }

        CategoryTypes createdCategoryType = categoryTypesService.add(categoryType);
        return new ResponseEntity<>(createdCategoryType, HttpStatus.OK);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<CategoryTypes> update(@PathVariable("id") String id, @RequestBody CategoryTypes categoryType) {
        CategoryTypes existingCategoryType = categoryTypesService.findById(id);
        if (existingCategoryType == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        categoryType.setTypeId(id); // Đảm bảo tính nhất quán về ID
        categoryTypesService.update(categoryType);
        return new ResponseEntity<>(categoryType, HttpStatus.OK);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id) {
        CategoryTypes existingCategoryType = categoryTypesService.findById(id);
        if (existingCategoryType == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        categoryTypesService.delete(id);
        return new ResponseEntity<>(HttpStatus.OK);
    }
}
