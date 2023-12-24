package com.greenhouse.service.impl;

import com.greenhouse.model.Authorities;
import com.greenhouse.repository.AuthoritiesRepository;
import com.greenhouse.service.AuthoritiesService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthoritiesServiceImpl implements AuthoritiesService{

     @Autowired
    private AuthoritiesRepository authoritiesRepository;


    public List<Authorities> findAll() {
        return authoritiesRepository.findAll();
    }

    public Authorities findById(Integer authoritiesId) {
        Optional<Authorities> result = authoritiesRepository.findById(authoritiesId);
        return result.orElse(null);
    }

    public void add(Authorities authorities) {
        authoritiesRepository.save(authorities);
    }

    public void update(Authorities authorities) {
        authoritiesRepository.save(authorities);
    }

    public void delete(Integer authoritiesId) {
        authoritiesRepository.deleteById(authoritiesId);
    }
}
