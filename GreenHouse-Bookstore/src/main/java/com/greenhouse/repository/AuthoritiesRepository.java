package com.greenhouse.repository;

import com.greenhouse.model.Authorities;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuthoritiesRepository extends JpaRepository<Authorities, Integer> {
    
	List<Authorities> findByUsername(String username);
 
    Long countByRoleId(Long roleId);
}
