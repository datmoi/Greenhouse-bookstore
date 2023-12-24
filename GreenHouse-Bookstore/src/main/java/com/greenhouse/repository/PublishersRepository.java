package com.greenhouse.repository;

import com.greenhouse.model.Publishers;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PublishersRepository extends JpaRepository<Publishers, String> {

    Optional<Publishers> findByPublisherName(String publisherName);
    
}
