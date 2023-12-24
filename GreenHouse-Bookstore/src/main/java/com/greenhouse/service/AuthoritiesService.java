package com.greenhouse.service;

import com.greenhouse.model.Authorities;
import java.util.List;

public interface AuthoritiesService {

    List<Authorities> findAll();

    Authorities findById(Integer id);
   
    void add(Authorities entity);

    void update(Authorities entity);

    void delete(Integer id);
}
