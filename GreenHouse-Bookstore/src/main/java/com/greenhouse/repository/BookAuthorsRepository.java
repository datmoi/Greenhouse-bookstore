package com.greenhouse.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.greenhouse.model.Book_Authors;
import com.greenhouse.model.Products;

public interface BookAuthorsRepository extends JpaRepository<Book_Authors, Integer> {

    List<Book_Authors> findByAuthor_AuthorId(String authorId);

    // Các phương thức truy vấn tùy chỉnh nếu cần
    Book_Authors findByProduct(Products product);
}
