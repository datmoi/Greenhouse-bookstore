package com.greenhouse.restcontroller.client;

import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.dto.client.CartDTO;
import com.greenhouse.dto.client.CartVoucherDTO;
import com.greenhouse.model.Accounts;
import com.greenhouse.model.Carts;
import com.greenhouse.model.Discounts;
import com.greenhouse.model.Flash_Sales;
import com.greenhouse.model.Product_Category;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Product_Discount;
import com.greenhouse.model.Product_Flash_Sale;
import com.greenhouse.model.UserVoucher;
import com.greenhouse.model.VoucherMappingCategory;
import com.greenhouse.model.VoucherMappingProduct;
import com.greenhouse.model.Vouchers;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.CartsRepository;
import com.greenhouse.repository.DiscountsRepository;
import com.greenhouse.repository.FlashSalesRepository;
import com.greenhouse.repository.ProductCategoryRepository;
import com.greenhouse.repository.ProductDetailRepository;
import com.greenhouse.repository.ProductDiscountRepository;
import com.greenhouse.repository.Product_FlashSaleRepository;
import com.greenhouse.repository.UserVoucherRepository;
import com.greenhouse.repository.VoucherMappingCategoryRepository;
import com.greenhouse.repository.VoucherMappingProductRepository;
import com.greenhouse.service.CheckoutService;

@RestController
@RequestMapping("/customer/rest/cart")
public class CartController {

    @Autowired
    private CartsRepository cartsRepository;
    @Autowired
    private AccountRepository accountRepository;
    @Autowired
    private ProductDetailRepository productDetailRepository;
    @Autowired
    private UserVoucherRepository userVoucherRepository;
    @Autowired
    private VoucherMappingCategoryRepository voucherMappingCategoryRepository;
    @Autowired
    private VoucherMappingProductRepository voucherMappingProductRepository;
    @Autowired
    private ProductCategoryRepository productCategoryRepository;
    @Autowired
    private CheckoutService checkoutService;
    @Autowired
    private FlashSalesRepository flashSalesRepository;
    @Autowired
    private Product_FlashSaleRepository product_FlashSaleRepository;
    @Autowired
    private DiscountsRepository discountsRepository;
    @Autowired
    private ProductDiscountRepository productDiscountRepository;

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addToCart(@RequestBody CartDTO data) {
        Map<String, Object> response = new HashMap<>();
        String status = "error";
        String message = "Lỗi API thêm sản phẩm vào giỏ hàng";

        try {
            Accounts accounts = accountRepository.findById(data.getUsername()).orElse(null);
            Product_Detail productDetail = productDetailRepository.findById(data.getProductDetailId()).orElse(null);

            if (accounts != null && productDetail != null) {
                Carts duplicate = cartsRepository.findCartsByUsernameAndProductDetailIdAndStatus(
                        accounts.getUsername(), productDetail.getProductDetailId(), true);

                int quantity = data.getQuantity();
                Double price = productDetail.getPrice();
                Double priceDiscount = productDetail.getPriceDiscount();
                Double amount = quantity * (priceDiscount > 0 ? priceDiscount : price);
                if (duplicate != null) {
                    quantity += duplicate.getQuantity();
                }

                if (productDetail.getQuantityInStock() - quantity >= 0) {
                    if (duplicate != null) {
                        int newQuantity = duplicate.getQuantity() + quantity;
                        amount = newQuantity * (priceDiscount > 0 ? priceDiscount : price);

                        duplicate.setQuantity(newQuantity);
                        duplicate.setAmount(amount);
                        cartsRepository.save(duplicate);
                    } else {
                        Carts cart = new Carts();

                        cart.setAccount(accounts);
                        cart.setProductDetail(productDetail);

                        cart.setQuantity(quantity);
                        cart.setPrice(price);
                        cart.setPriceDiscount(priceDiscount);
                        cart.setAmount(amount);
                        cart.setStatus(true);

                        cartsRepository.save(cart);
                    }
                    status = "success";
                    message = "Đã thêm sản phẩm vào giỏ hàng";
                } else if (duplicate != null) {
                    int addMaxQuantity = productDetail.getQuantityInStock() - duplicate.getQuantity();
                    status = "error";
                    if (duplicate.getQuantity() > 0) {
                        message = "Số lượng trong giỏ hàng bạn đã có nhiều hơn số lượng còn của sản phẩm.";
                    } else {
                        message = "Bạn có thể thêm tối đa: "
                                + (addMaxQuantity > 0 ? addMaxQuantity : 0);
                    }
                } else {
                    status = "error";
                    message = "Bạn có thể thêm tối đa: "
                            + (productDetail.getQuantityInStock());
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        response.put("status", status);
        response.put("message", message);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/getCart")
    public ResponseEntity<Map<String, Object>> getCart(@RequestParam String username) {
        Map<String, Object> response = new HashMap<>();
        String status = "error";
        String message = "Lỗi API lấy dữ liệu của giỏ hàng";

        List<Carts> listCart = new ArrayList<>();
        try {
            listCart = cartsRepository.findByAccountIdAndStatusOrderByCreatedDateDesc(username, true);
            // ----------------------------------------------------------------
            for (Carts carts : listCart) {
                updatePriceCart(carts);
            }
            // ----------------------------------------------------------------
            status = "success";
            message = "Lấy dữ liệu giỏ hàng của người dùng: [" + username + "] thành công";
        } catch (Exception e) {
            System.out.println(e);
        }

        response.put("listCart", listCart);
        response.put("status", status);
        response.put("message", message);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/getProductCategory")
    public ResponseEntity<Map<String, Object>> getProductCategory() {
        Map<String, Object> response = new HashMap<>();

        List<Product_Category> listProductCategory = new ArrayList<>();
        listProductCategory = productCategoryRepository.findAll();

        response.put("listProductCategory", listProductCategory);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/updateQuantity")
    public ResponseEntity<Map<String, Object>> updateQuantity(@RequestBody Map<String, Object> data) {
        Map<String, Object> response = new HashMap<>();
        String status = "";
        String message = "";

        int cartId = Integer.valueOf(data.get("cartId").toString());

        Carts cart = cartsRepository.findById(cartId).orElse(null);

        if (cart != null && data.get("quantity").toString().matches("^[0-9]+$")) {
            int quantity = Integer.valueOf(data.get("quantity").toString());
            int quantityInStock = cart.getProductDetail().getQuantityInStock();

            if (quantityInStock - quantity >= 0) {
                if (quantity > 0) {
                    Optional<Flash_Sales> flashSalesOptional = Optional
                            .ofNullable(flashSalesRepository.findByStatus(2));
                    List<Product_Flash_Sale> pfs = flashSalesOptional
                            .map(flashSales -> product_FlashSaleRepository.findByFlashSaleId(flashSales))
                            .orElse(new ArrayList<>());

                    for (Product_Flash_Sale item : pfs) {
                        if (item.getProductDetail().getProductDetailId() == cart.getProductDetail()
                                .getProductDetailId()) {
                            int remainingQuantity = item.getQuantity() - item.getUsedQuantity();
                            if (remainingQuantity > 0) {
                                if (quantity > remainingQuantity && (quantity - 1) == remainingQuantity
                                        && remainingQuantity < item.getQuantity()) {
                                    status = "info";
                                    message = "Số lượng sản phẩm trong FLASH SALE chỉ còn: " + remainingQuantity
                                            + " sản phẩm!";
                                } else if (quantity < remainingQuantity && quantity > item.getPurchaseLimit()
                                        && quantity - 1 == item.getPurchaseLimit()) {
                                    status = "info";
                                    message = "Số lượng mua giới hạn mỗi lượt trong FLASH SALE là: "
                                            + item.getPurchaseLimit()
                                            + ". Xin vui lòng cân nhắc!";
                                }

                            }
                        }
                    }
                    cart.setQuantity(quantity);
                    cartsRepository.save(cart);
                    updatePriceCart(cart);
                }
            } else {
                status = "error";
                message = "Sản phẩm [" + cart.getProductDetail().getProduct().getProductName()
                        + "] chỉ còn: " + cart.getProductDetail().getQuantityInStock();
            }
        }

        response.put("cart", cart);
        response.put("status", status);
        response.put("message", message);

        return ResponseEntity.ok(response);
    }

    private void updatePriceCart(Carts cart) {
        Optional<Flash_Sales> flashSalesOptional = Optional.ofNullable(flashSalesRepository.findByStatus(2));
        List<Product_Flash_Sale> pfs = flashSalesOptional
                .map(flashSales -> product_FlashSaleRepository.findByFlashSaleId(flashSales))
                .orElse(new ArrayList<>());
        boolean isFlashSales = false;
        boolean isDiscount = false;
        for (Product_Flash_Sale pf : pfs) {
            if (pf.getProductDetail().getProductDetailId() == cart.getProductDetail().getProductDetailId()) {
                int remainingQuantity = pf.getQuantity() - pf.getUsedQuantity();
                if (remainingQuantity >= pf.getPurchaseLimit()) {
                    remainingQuantity = pf.getPurchaseLimit();
                }
                int quantity = cart.getQuantity();
                if (quantity <= remainingQuantity) {
                    Double priceOriginal = cart.getProductDetail().getPrice();
                    Double discountPercent = Double.valueOf(pf.getDiscountPercentage()) / 100;
                    Double priceDiscount = priceOriginal * (1 - discountPercent);
                    cart.setPriceDiscount(priceDiscount);
                    cart.setAmount(cart.getQuantity() * cart.getPriceDiscount());
                    cartsRepository.save(cart);
                    isFlashSales = true;
                }
            }
        }
        if (!isFlashSales) {
            List<Discounts> discountList = discountsRepository.findActiveDiscountsNowAndActive(new Date(),
                    true);
            for (Discounts d : discountList) {
                Product_Discount pdDiscount = productDiscountRepository
                        .findByProductDetailAndDiscount(cart.getProductDetail(), d);
                if (pdDiscount != null) {
                    Double priceOriginal = cart.getProductDetail().getPrice();
                    Double discountPercent = Double.valueOf(pdDiscount.getDiscount().getValue()) / 100;
                    Double priceDiscount = priceOriginal * (1 - discountPercent);
                    cart.setPriceDiscount(priceDiscount);
                    cart.setAmount(cart.getQuantity() * cart.getPriceDiscount());
                    cartsRepository.save(cart);
                    isDiscount = true;
                }
            }
        }

        if (!isFlashSales && !isDiscount) {
            Double priceOriginal = cart.getProductDetail().getPrice();
            Double priceDiscount = priceOriginal;
            cart.setPriceDiscount(priceDiscount);
            cart.setAmount(cart.getQuantity() * cart.getPriceDiscount());
            cartsRepository.save(cart);
        }
    }

    @PostMapping("/remove")
    public ResponseEntity<Map<String, Object>> removeCart(@RequestBody Integer cartId) {
        Carts cart = new Carts();
        cart = cartsRepository.findById(cartId).get();

        if (cart != null) {
            cartsRepository.delete(cart);
        }

        return ResponseEntity.ok(null);
    }

    @PostMapping("/removeSelected")
    public ResponseEntity<Map<String, Object>> removeCartSelected(@RequestBody List<Carts> listCarts) {
        if (listCarts.size() > 0) {
            for (Carts carts : listCarts) {
                if (carts != null) {
                    cartsRepository.delete(carts);
                }
            }
        }
        return ResponseEntity.ok(null);
    }

    @GetMapping("/getVoucher")
    public ResponseEntity<Map<String, Object>> getVoucherByUsername(@RequestParam String username) {
        Map<String, Object> response = new HashMap<>();
        String status = "error";
        String message = "Lỗi API lấy dữ liệu của giỏ hàng";

        List<UserVoucher> listUserVouchers = new ArrayList<>();
        List<Vouchers> listVouchers = new ArrayList<>();
        List<VoucherMappingCategory> listVouchersMappingCategories = new ArrayList<>();
        List<VoucherMappingProduct> listVouchersMappingProduct = new ArrayList<>();

        try {
            listUserVouchers = userVoucherRepository.findByUsernameAndStatus(username, true);
            for (UserVoucher item : listUserVouchers) {
                if (isVoucherValid(item.getVoucher())) {
                    listVouchers.add(item.getVoucher());

                    List<VoucherMappingCategory> listVMC = new ArrayList<>();
                    List<VoucherMappingProduct> listVMP = new ArrayList<>();

                    listVMP = voucherMappingProductRepository.findByVoucherId(item.getVoucher().getVoucherId());
                    listVMC = voucherMappingCategoryRepository
                            .findByVoucherId(item.getVoucher().getVoucherId());

                    listVouchersMappingCategories.addAll(listVMC);
                    listVouchersMappingProduct.addAll(listVMP);
                }
            }
            status = "success";
            message = "Lấy danh sách voucher của người dùng: [" + username + "] thành công";
        } catch (Exception e) {
            System.out.println(e);
        }

        response.put("listVouchers", listVouchers);
        response.put("listVouchersMappingCategories", listVouchersMappingCategories);
        response.put("listVouchersMappingProducts", listVouchersMappingProduct);
        response.put("status", status);
        response.put("message", message);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/validateVoucher")
    public ResponseEntity<Map<String, Object>> validateVoucher(@RequestBody CartVoucherDTO voucherDTO) {
        Map<String, Object> response = new HashMap<>();
        boolean validNormalVoucher = false;
        boolean validShippingVoucher = false;

        Vouchers normalVoucher = voucherDTO.getNormalVoucherApplied();
        Vouchers shippingVoucher = voucherDTO.getShippingVoucherApplied();

        if (normalVoucher != null) {
            validNormalVoucher = checkoutService.isVoucherValid(normalVoucher);
        }

        if (shippingVoucher != null) {
            validShippingVoucher = checkoutService.isVoucherValid(shippingVoucher);
        }
        List<Vouchers> voucherIsNotValid = new ArrayList<>();
        if (!validNormalVoucher && normalVoucher != null) {
            voucherIsNotValid.add(normalVoucher);
        }
        if (!validShippingVoucher && shippingVoucher != null) {
            voucherIsNotValid.add(shippingVoucher);
        }
        if (!voucherIsNotValid.isEmpty()) {
            response.put("listVoucherIsNotValid", voucherIsNotValid);
            response.put("status", "error");
            response.put("message", "Mã giảm giá không hợp lệ!");
        } else {
            response.put("status", "success");
            response.put("message", "Mã giảm giá đã áp dụng thành công!");
        }

        return ResponseEntity.ok(response);
    }

    @PostMapping("/validatePurchaseLimitFlashSale")
    public ResponseEntity<Map<String, Object>> validatePurchaseLimitFlashSale(@RequestBody List<Carts> listCartItems) {
        Map<String, Object> response = new HashMap<>();
        String status = "success";
        String message = "Purchase limit is valid.";

        Optional<Flash_Sales> flashSalesOptional = Optional.ofNullable(flashSalesRepository.findByStatus(2));
        List<Product_Flash_Sale> pfs = new ArrayList<>();
        if (flashSalesOptional.isPresent()) {
            pfs = product_FlashSaleRepository.findByFlashSaleId(flashSalesOptional.get());
        }

        if (!listCartItems.isEmpty() && flashSalesOptional.isPresent() && !pfs.isEmpty()) {
            List<Carts> listNotValidPurchaseLimit = new ArrayList<>();
            for (Carts cart : listCartItems) {
                pfs.stream()
                        .filter(pf -> cart.getProductDetail().getProductDetailId() == pf.getProductDetail()
                                .getProductDetailId()
                                && cart.getQuantity() > pf.getPurchaseLimit())
                        .findFirst()
                        .ifPresent(pf -> {
                            listNotValidPurchaseLimit.add(cart);
                        });
            }
            if (!listNotValidPurchaseLimit.isEmpty()) {
                status = "error";
                message = "Purchase limit is not valid.";
                response.put("listNotValidPurchaseLimit", listNotValidPurchaseLimit);
            }
        }

        response.put("status", status);
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/getProductFlashSales")
    public ResponseEntity<Map<String, Object>> getProductFlashSales() {
        Map<String, Object> response = new HashMap<>();
        String status = "success";
        String message = "get List product flash sale success.";

        Optional<Flash_Sales> flashSalesOptional = Optional.ofNullable(flashSalesRepository.findByStatus(2));
        List<Product_Flash_Sale> pfs = new ArrayList<>();
        if (flashSalesOptional.isPresent()) {
            pfs = product_FlashSaleRepository.findByFlashSaleId(flashSalesOptional.get());
        } else {
            status = "error";
            message = "get List product flash sale fail.";
        }

        response.put("listProductFlashSales", pfs);
        response.put("status", status);
        response.put("message", message);
        return ResponseEntity.ok(response);
    }

    private static boolean isVoucherValid(Vouchers voucher) {
        Date currentDate = new Date();
        int stock = voucher.getTotalQuantity() - voucher.getUsedQuantity();
        if (currentDate.before(voucher.getEndDate()) && currentDate.after(voucher.getStartDate()) && stock > 0) {
            return true;
        } else {
            return false;
        }
    }
}
