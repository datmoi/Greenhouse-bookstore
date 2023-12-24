package com.greenhouse.restcontroller.client;

import com.greenhouse.dto.AuthenticationDTO;
import com.greenhouse.dto.AuthenticationResponse;
import com.greenhouse.dto.Response;
import com.greenhouse.model.Accounts;
import com.greenhouse.model.Authorities;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.AuthoritiesRepository;
import com.greenhouse.util.JwtUtil;

import io.micrometer.common.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@RestController
public class AuthenticationController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    AccountRepository repository;

    @Autowired
    private AuthoritiesRepository authoritiesRepository;

    @PostMapping(path = "/authenticate", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> createAuthenticationToken(@RequestBody AuthenticationDTO authenticationDTO) {
        if (StringUtils.isBlank(authenticationDTO.getUsername())
                || StringUtils.isBlank(authenticationDTO.getPassword())) {
            return ResponseEntity.badRequest().body(new Response("Thông tin không được bỏ trống", 400));
        }

        Accounts accounts = repository.findByUsernameOrEmailOrPhone(authenticationDTO.getUsername(),
                authenticationDTO.getUsername(), authenticationDTO.getUsername());

        if (accounts == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response("Tên đăng nhập hoặc mật khẩu không chính xác", 404));
        }

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(accounts.getUsername(), authenticationDTO.getPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response("Tên đăng nhập hoặc mật khẩu không chính xác", 401));
        } catch (DisabledException disabledException) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new Response("Người dùng chưa được kích hoạt", 403));
        }
        List<Authorities> authorities = authoritiesRepository.findByUsername(authenticationDTO.getUsername());
        // Tạo danh sách các quyền từ danh sách Authorities
        List<GrantedAuthority> authoritiesList = authorities.stream()
                .map(authority -> new SimpleGrantedAuthority("ROLE_" + authority.getRole().getRole()))
                .collect(Collectors.toList());
        final String jwt = jwtUtil.generateToken(accounts, authoritiesList);
        return ResponseEntity.ok(new AuthenticationResponse(jwt));
    }

}
