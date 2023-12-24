package com.greenhouse.service;

import com.greenhouse.model.Publishers;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import java.util.List;

import org.springframework.data.domain.Page;
import java.util.List;


public interface PublishersService {

    List<Publishers> findAll();

    Publishers findById(String publisherId);

    Publishers add(Publishers entity);

    Publishers update(Publishers entity);

    void delete(String publisherId);

}
