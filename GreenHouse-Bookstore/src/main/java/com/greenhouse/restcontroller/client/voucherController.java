package com.greenhouse.restcontroller.client;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.dto.client.UserVoucherDTO;
import com.greenhouse.model.UserVoucher;
import com.greenhouse.model.Vouchers;
import com.greenhouse.repository.UserVoucherRepository;
import com.greenhouse.repository.VouchersRepository;

@RestController
@RequestMapping("/customer/rest/voucher")
public class voucherController {

    @Autowired
    VouchersRepository vouchersRepository;

    @Autowired
    UserVoucherRepository userVoucherRepository;

    @GetMapping("/list-vouchers")
    public ResponseEntity<Map<String, Object>> getVouchers() {
        Map<String, Object> response = new HashMap<>();

        List<Vouchers> listActiveVouchers = vouchersRepository.findActiveVouchers();

        List<Vouchers> listVouchersProduct = new ArrayList<>();
        List<Vouchers> listVouchersTypeProduct = new ArrayList<>();
        List<Vouchers> listVouchersShip = new ArrayList<>();

        for (Vouchers vouchers : listActiveVouchers) {
            if (vouchers.getVoucherType().equals("Ship")) {
                listVouchersShip.add(vouchers);
            } else if (vouchers.getVoucherType().equals("Sản phẩm")) {
                listVouchersProduct.add(vouchers);
            } else {
                listVouchersTypeProduct.add(vouchers);
            }
        }

        response.put("listVouchersProduct", listVouchersProduct);
        response.put("listVouchersTypeProduct", listVouchersTypeProduct);
        response.put("listVouchersShip", listVouchersShip);

        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "add/voucher")
    private ResponseEntity<Map<String, Object>> createVoucher(@RequestBody UserVoucherDTO UserVoucherDTO) {
        Map<String, Object> response = new HashMap<>();

        if (UserVoucherDTO.getUsername() == null || UserVoucherDTO.getUsername().isEmpty()) {
            response.put("message", "Vui lòng đăng nhập");
            response.put("status", 400);
            return ResponseEntity.ok(response);
        }

        UserVoucher checkdulicaUserVoucher = userVoucherRepository
                .findByUsernameAndVoucher(UserVoucherDTO.getUsername(), UserVoucherDTO.getVoucher());

        if (checkdulicaUserVoucher != null) {
            response.put("message", "Voucher " + UserVoucherDTO.getVoucher().getVoucherName() + " đã có trong kho của bạn");
            response.put("status", 403);
            return ResponseEntity.ok(response);
        }

        UserVoucher newUserVoucher = new UserVoucher();
        newUserVoucher.setUsername(UserVoucherDTO.getUsername());
        newUserVoucher.setVoucher(UserVoucherDTO.getVoucher());
        newUserVoucher.setStatus(true);
        userVoucherRepository.save(newUserVoucher);
        response.put("message", "Đã lưu voucher " + UserVoucherDTO.getVoucher().getVoucherName());
        response.put("status", 200);
        return ResponseEntity.ok(response);
    }
}
