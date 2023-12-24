package com.greenhouse.service;

import com.greenhouse.model.Authors;

import java.util.List;

public interface AuthorsService {

    List<Authors> findAll();

    Authors findById(String id);

    Authors add(Authors entity);

    Authors update(Authors entity);

    void delete(String id);
}
