package com.greenhouse.restcontroller.client;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.model.Accounts;
import com.greenhouse.model.Book_Authors;
import com.greenhouse.model.Brands;
import com.greenhouse.model.Categories;
import com.greenhouse.model.CategoryTypes;
import com.greenhouse.model.InvoiceDetails;
import com.greenhouse.model.Notification;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Product_Discount;
import com.greenhouse.model.Product_Reviews;
import com.greenhouse.model.Search_History;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.BookAuthorsRepository;
import com.greenhouse.repository.BrandRepository;
import com.greenhouse.repository.CategoriesRepository;
import com.greenhouse.repository.CategoryTypesRepository;
import com.greenhouse.repository.InvoiceDetailsRepository;
import com.greenhouse.repository.ProductDetailRepository;
import com.greenhouse.repository.ProductDiscountRepository;
import com.greenhouse.repository.ProductReviewsRepository;
import com.greenhouse.repository.ProductsRepository;

@CrossOrigin("*")
@RestController
@RequestMapping("/customer")
public class IndexController {

    @Autowired
    ProductsRepository productsReps;
    @Autowired
    BrandRepository brandReps;
    @Autowired
    ProductDetailRepository productDetailReps;
    @Autowired
    private ProductDiscountRepository productDiscountRepository;
    @Autowired
    private ProductReviewsRepository productReviewsRepository;
    @Autowired
    private BookAuthorsRepository bookAuthorsRepository;
    @Autowired
    private InvoiceDetailsRepository invoiceDetailRepository;
    @Autowired
    private CategoryTypesRepository categoryTypesRepository;
    @Autowired
    private CategoriesRepository categoriesRepository;
    @Autowired
    AccountRepository accountsRepository;

    @GetMapping("/rest/getDataIndex")
    public ResponseEntity<Map<String, Object>> getDataIndex() {
        Map<String, Object> resp = new HashMap<>();

        List<Product_Detail> sellingProducts = productDetailReps.SellingProduct();
        List<Brands> sellingBrands = brandReps.findBrandsWithSales();
        List<Product_Detail> listProduct_Details = productDetailReps.findAll();
        List<Product_Discount> listProductDiscount = productDiscountRepository.findProductDiscountsByDate();
        List<Product_Reviews> listProductReviews = productReviewsRepository.findAll();
        List<Book_Authors> listBookAuthor = bookAuthorsRepository.findAll();
        List<InvoiceDetails> listInvoiceDetails = invoiceDetailRepository.findAll();
        List<String> distinctParentCategoriesTypes = categoryTypesRepository.findDistinctParentCategoriesType();
        List<CategoryTypes> listCategoryTypes = categoryTypesRepository.findAll();
        List<Categories> listCategories = categoriesRepository.findAll();
        List<Product_Detail> listProductDiscountToday = productDetailReps.findProductsOnDiscount();

        resp.put("listProductDiscountToday", listProductDiscountToday);
        resp.put("listCategories", listCategories);
        resp.put("parentCategoriesTypes", distinctParentCategoriesTypes);
        resp.put("listCategoryTypes", listCategoryTypes);
        resp.put("listInvoiceDetails", listInvoiceDetails);
        resp.put("listProduct_Details", listProduct_Details);
        resp.put("sellingBrands", sellingBrands);
        resp.put("sellingProducts", sellingProducts);
        resp.put("listProductDiscount", listProductDiscount);
        resp.put("listProductReviews", listProductReviews);
        resp.put("listBookAuthor", listBookAuthor);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/rest/getProductsByBrand/{brandId}")
    public ResponseEntity<List<Product_Detail>> getProductsByBrand(@PathVariable String brandId) {
        List<Product_Detail> products = productDetailReps.findProductDetailsByProduct_Brand_BrandId(brandId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/rest/getSearchData")
    public ResponseEntity<Map<String, Object>> getSearchData() {
        Map<String, Object> resp = new HashMap<>();
        List<Product_Detail> listProduct_Details = productDetailReps.findAll();
        List<Product_Detail> listSearchInvoice = productDetailReps.findBySearchInvoice();
        resp.put("listSearch_Invoice", listSearchInvoice);
        resp.put("listProduct_Details", listProduct_Details);
        return ResponseEntity.ok(resp);
    }

}