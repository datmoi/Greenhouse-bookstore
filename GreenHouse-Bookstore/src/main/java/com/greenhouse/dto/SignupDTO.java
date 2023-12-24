package com.greenhouse.dto;

import lombok.Data;

@Data
public class SignupDTO {

    private String password;
    private String repassword;
    private String emailAndPhone;
    private String code;

}
