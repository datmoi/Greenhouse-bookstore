package com.greenhouse.restcontroller.admin;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.dto.Response;
import com.greenhouse.model.Authorities;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.AuthoritiesRepository;
import com.greenhouse.repository.RolesRepository;

@RestController
@RequestMapping("/rest/authorities") // Đường dẫn gốc cho RestAuthoritiesController
public class RestAuthoritiesController {

    @Autowired
    AuthoritiesRepository authoritiesRepository;

    @Autowired
    RolesRepository rolesRepository;

    @Autowired
    AccountRepository accountRepository;

    @GetMapping
    public Map<String, Object> getAuthorities() {
        Map<String, Object> data = new HashMap<>();
        data.put("authorities", authoritiesRepository.findAll());
        data.put("roles", rolesRepository.findAll());
        data.put("accounts", accountRepository.findByDeletedByIsNullAndDeletedAtIsNull());
        return data;
    }

    @GetMapping("/duplicate")
    public Map<String, Object> getAuthoritiesByUsername(@RequestParam String username) {
        Map<String, Object> data = new HashMap<>();
        data.put("authorities", authoritiesRepository.findByUsername(username));
        return data;
    }

    @PostMapping
    public ResponseEntity<Authorities> createAuthorities(@RequestBody Authorities newAuthorities) {
        // Thực hiện các bước tạo mới
        Authorities createdAuthorities = authoritiesRepository.save(newAuthorities);
        return ResponseEntity.ok(createdAuthorities);
    }

    @DeleteMapping("/{authoritiesId}/{username}") // Đường dẫn ID được truyền qua biến authoritiesId
    public ResponseEntity<Response> delete(@PathVariable("authoritiesId") Integer authoritiesId,
                                           @PathVariable("username") String username) {
        Response response = new Response();
        Authorities authorities = authoritiesRepository.findById(authoritiesId).get();
        if (authorities.getUsername().equals(username)) {
            response.setStatus(400);
            response.setMessage("Không thể thay đổi.");
            return ResponseEntity.status(response.getStatus()).body(response);
        }
        authoritiesRepository.deleteById(authoritiesId);
        response.setStatus(200);
        response.setMessage("Cập nhật thành công");
        return ResponseEntity.status(response.getStatus()).body(response);
    }
}
