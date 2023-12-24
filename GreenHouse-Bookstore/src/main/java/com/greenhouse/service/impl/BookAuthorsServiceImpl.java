package com.greenhouse.service.impl;

import com.greenhouse.model.Book_Authors;
import com.greenhouse.model.Products;
import com.greenhouse.repository.BookAuthorsRepository;
import com.greenhouse.service.BookAuthorsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BookAuthorsServiceImpl implements BookAuthorsService {

    @Autowired
    private BookAuthorsRepository bookAuthorsRepository;

    @Override
    public List<Book_Authors> findAll() {
        return bookAuthorsRepository.findAll();
    }

    @Override
    public Book_Authors findById(Integer id) {
        Optional<Book_Authors> result = bookAuthorsRepository.findById(id);
        return result.orElse(null);
    }

    @Override
    public Book_Authors add(Book_Authors bookAuthors) {
        return bookAuthorsRepository.save(bookAuthors);
    }

    @Override
    public Book_Authors update(Book_Authors bookAuthors) {
        return bookAuthorsRepository.save(bookAuthors);
    }

    @Override
    public void delete(Integer id) {
        bookAuthorsRepository.deleteById(id);
    }

    @Override
    public List<Book_Authors> findByAuthorId(String authorId) {
        return bookAuthorsRepository.findByAuthor_AuthorId(authorId);
    }

    @Override
    public Book_Authors findByProduct(Products product) {
        return bookAuthorsRepository.findByProduct(product);
    }
}
