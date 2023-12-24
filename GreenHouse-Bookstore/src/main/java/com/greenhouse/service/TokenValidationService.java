package com.greenhouse.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.greenhouse.util.JwtUtil;

@Service
public class TokenValidationService {
	@Autowired
    private JwtUtil jwtUtil;

    public boolean isTokenValid(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return !jwtUtil.isTokenExpired(token);
        }
        return false;
    }
}
