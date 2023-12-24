package com.greenhouse.restcontroller.client;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.google.gson.Gson;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.greenhouse.model.Accounts;
import com.greenhouse.model.UserVoucher;
import com.greenhouse.model.Address;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.AddressRepository;
import com.greenhouse.repository.UserVoucherRepository;
import com.greenhouse.util.ImageUploader;

@CrossOrigin("*")
@RestController
@RequestMapping("/customer")
public class ProfileRestController {

    @Autowired
    AccountRepository acc;

    @Autowired
    AddressRepository addressRepository;

    @Autowired
    AccountRepository accountRepository;

    @Autowired
    UserVoucherRepository userVoucherRepository;

    @GetMapping("/rest/address/{username}")
    public ResponseEntity<Map<String, Object>> getAddressByUsername(@PathVariable String username) {
        List<Optional<Address>> addresses = addressRepository.findByUsername(username);
        Map<String, Object> response = new HashMap<>();

        List<Address> addressList = new ArrayList<>();
        addresses.forEach(optional -> optional.ifPresent(addressList::add));

        response.put("success", !addressList.isEmpty());
        response.put("listAddress", addressList);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/rest/profile_address/{id}")
    public ResponseEntity<Optional<Address>> getOne(@PathVariable("id") Integer id) {
        if (addressRepository.findById(id) == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(addressRepository.findById(id));
    }

    @PostMapping("/rest/profile_address")
    public ResponseEntity<Address> createAddress(@RequestBody Address reqAddress) {
        Address address = addressRepository.save(reqAddress);
        return new ResponseEntity<>(address, HttpStatus.CREATED);
    }

    @DeleteMapping("/rest/profile_address/{id}")
    public ResponseEntity<Void> deleteAddress(@PathVariable("id") Integer id) {
        Optional<Address> address = addressRepository.findById(id);
        if (!address.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        addressRepository.delete(address.get());
        return ResponseEntity.noContent().build();
    }

    // VOUCHER
    @GetMapping("/rest/profile_voucher/{username}")
    public ResponseEntity<Map<String, Object>> getUserVoucherById(@PathVariable String username) {

        List<Optional<UserVoucher>> userVouchers = userVoucherRepository.findByUsername(username);
        Map<String, Object> response = new HashMap<>();

        List<UserVoucher> userVouchersList = new ArrayList<>();
        userVouchers.forEach(optional -> optional.ifPresent(userVouchersList::add));

        response.put("success", !userVouchersList.isEmpty());
        response.put("userVouchersList", userVouchersList);
        return ResponseEntity.ok(response);
    }

    // ACCOUNT
    @GetMapping("/rest/profile_account/{username}")
    public ResponseEntity<Accounts> getAccountfindByUsername(@PathVariable String username) {
        return ResponseEntity.ok(acc.findByUsername(username));
    }

    @PostMapping("/rest/profile_account")
    public ResponseEntity<Accounts> updateAccount(@RequestParam(value = "image", required = false) MultipartFile file,
                                                  @RequestParam("AccountJson") String AccountJson) {
        String photoUrl = null;

        if (file != null && !file.isEmpty()) {
            try {
              photoUrl = ImageUploader.uploadImage(file, "account_" + System.currentTimeMillis());
         } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
            }
        }

        Accounts newAccount = new Gson().fromJson(AccountJson, Accounts.class);

        if (photoUrl != null) {
            newAccount.setImage(photoUrl);
        }

        // Tiếp tục với việc cập nhật thông tin tài khoản
        Accounts existingAccount = accountRepository.findByUsername(newAccount.getUsername());

        if (existingAccount != null) {
            existingAccount.setFullname(newAccount.getFullname());
            existingAccount.setEmail(newAccount.getEmail());
            existingAccount.setGender(newAccount.getGender());
            existingAccount.setBirthday(newAccount.getBirthday());
            existingAccount.setPhone(newAccount.getPhone());
            existingAccount.setActive(newAccount.getActive());
            existingAccount.setCreatedAt(newAccount.getCreatedAt());
            existingAccount.setDeletedAt(newAccount.getDeletedAt());
            existingAccount.setDeletedBy(newAccount.getDeletedBy());

            if (photoUrl != null) {
                existingAccount.setImage(photoUrl);
            }

            accountRepository.save(existingAccount);

            return new ResponseEntity<>(existingAccount, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

 

}
