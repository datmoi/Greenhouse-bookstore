package com.greenhouse.repository;

import com.greenhouse.model.Notification;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUsernameUsernameOrderByStatusAscCreateAtDesc(String username);
}
