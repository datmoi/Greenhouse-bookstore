package com.greenhouse.restcontroller.admin;

import com.google.gson.Gson;
import com.greenhouse.model.Accounts;
import com.greenhouse.model.Authorities;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.AuthoritiesRepository;
import com.greenhouse.service.AccountsService;
import com.greenhouse.util.ImageUploader;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Date;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin("*")
@RequestMapping("/rest/accounts")
public class RestAccountController {

    @Autowired
    private AccountsService accountsService;
    @Autowired
    AccountRepository accountRepository;
    @Autowired
    AuthoritiesRepository authoritiesRepository;
 

    @GetMapping
    public ResponseEntity<List<Accounts>> getAllAccount() {
        List<Accounts> accounts = accountRepository.findByDeletedByIsNullAndDeletedAtIsNull();
        return new ResponseEntity<>(accounts, HttpStatus.OK);
    }

    @GetMapping("/{username}")
    public ResponseEntity<Accounts> getAccountsById(@PathVariable("username") String username) {
        Accounts accounts = accountsService.findById(username);
        if (accounts == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(accounts, HttpStatus.OK);
        }
    }

    @PostMapping
    public ResponseEntity<Object> create(@RequestParam(value = "image", required = false) MultipartFile file,
                                         @RequestParam("AccountJson") String AccountJson) {

        String photoUrl = null;
        if (file != null && !file.isEmpty()) {
            try {
                      photoUrl = ImageUploader.uploadImage(file, "account_" + System.currentTimeMillis());
   } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>("Lỗi khi tải ảnh lên Cloudinary.", HttpStatus.BAD_REQUEST);
            }
        }

        Accounts accounts = new Gson().fromJson(AccountJson, Accounts.class);

        if (photoUrl != null) {
            accounts.setImage(photoUrl);
        }

        Accounts editingAccount = accountsService.findById(accounts.getUsername());
        if (editingAccount != null) {
            return new ResponseEntity<>("Tài khoản đã tồn tại.", HttpStatus.BAD_REQUEST);
        }

        Accounts createAccounts = accountsService.add(accounts);
        return new ResponseEntity<>(createAccounts, HttpStatus.OK);
    }

    @PutMapping(value = "/{username}")
    public ResponseEntity<Accounts> update(@PathVariable("username") String username,
                                           @RequestParam(value = "image", required = false) MultipartFile file,
                                           @RequestParam("AccountJson") String AccountJson) {

        String photoUrl = null;
        if (file != null && !file.isEmpty()) {
            try {
                photoUrl = ImageUploader.uploadImage(file, "account_" + System.currentTimeMillis());
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        Accounts accounts = new Gson().fromJson(AccountJson, Accounts.class);

        if (photoUrl != null) {
            accounts.setImage(photoUrl);
        }

        accounts.setUsername(username);

        Accounts updatedAccounts = accountsService.update(accounts);
        return ResponseEntity.ok(updatedAccounts);
    }

    @DeleteMapping("/rest/account/{username}")
    public void delete(@PathVariable String username, @RequestParam String deletedBy) {
        Date currentDate = new Date();
        Accounts userDeleted = accountRepository.findById(username).orElse(null);
        if (userDeleted != null) {
            userDeleted.setActive(false);
            userDeleted.setDeletedAt(currentDate);
            userDeleted.setDeletedBy(deletedBy);
            accountRepository.save(userDeleted);

            List<Authorities> listDelete = authoritiesRepository.findByUsername(userDeleted.getUsername());
            for (Authorities item : listDelete) {
                authoritiesRepository.delete(item);
            }
        }
    }

  
}
