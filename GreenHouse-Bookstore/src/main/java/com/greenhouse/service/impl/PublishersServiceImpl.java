package com.greenhouse.service.impl;

import com.greenhouse.model.Publishers;
import com.greenhouse.repository.PublishersRepository;
import com.greenhouse.service.PublishersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PublishersServiceImpl implements PublishersService {

    @Autowired
    private PublishersRepository publishersRepository;

    @Override
    public List<Publishers> findAll() {
        return publishersRepository.findAll();
    }

    @Override
    public Publishers findById(String publisherId) {
        Optional<Publishers> result = publishersRepository.findById(publisherId);
        return result.orElse(null);
    }

    @Override
    public Publishers add(Publishers publisher) {
        return publishersRepository.save(publisher);
    }

    @Override
    public Publishers update(Publishers publisher) {
        return publishersRepository.save(publisher);
    }

    @Override
    public void delete(String publisherId) {
        publishersRepository.deleteById(publisherId);
    }

}
