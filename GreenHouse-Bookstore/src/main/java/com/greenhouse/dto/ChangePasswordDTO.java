package com.greenhouse.dto;

import lombok.Data;

@Data
public class ChangePasswordDTO {
    String token;
    String username;
    String newPassword;
    String confirmPassword;
    String email;
}

