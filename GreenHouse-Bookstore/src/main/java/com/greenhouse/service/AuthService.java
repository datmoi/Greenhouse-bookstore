package com.greenhouse.service;

import com.greenhouse.dto.SignupDTO;
import com.greenhouse.dto.UserDTO;
public interface AuthService {
    UserDTO signup(SignupDTO signupDTO);
}

