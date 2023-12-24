package com.greenhouse.restcontroller.client;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.greenhouse.model.Book_Authors;
import com.greenhouse.model.Brands;
import com.greenhouse.model.Categories;
import com.greenhouse.model.CategoryTypes;
import com.greenhouse.model.ImportInvoiceDetail;
import com.greenhouse.model.InvoiceDetails;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Product_Discount;
import com.greenhouse.model.Product_Images;
import com.greenhouse.model.Product_Reviews;
import com.greenhouse.repository.BookAuthorsRepository;
import com.greenhouse.repository.BrandRepository;
import com.greenhouse.repository.CategoriesRepository;
import com.greenhouse.repository.CategoryTypesRepository;
import com.greenhouse.repository.ImportInvoiceDetailRepository;
import com.greenhouse.repository.InvoiceDetailsRepository;
import com.greenhouse.repository.ProductDetailRepository;
import com.greenhouse.repository.ProductDiscountRepository;
import com.greenhouse.repository.ProductReviewsRepository;
import com.greenhouse.repository.Product_ImagesRepository;

@RestController
@RequestMapping("/customer/rest/product-page")
public class ProductPageController {

    @Autowired
    private ProductDetailRepository productDetailRepository;
    @Autowired
    private CategoryTypesRepository categoryTypesRepository;
    @Autowired
    private CategoriesRepository categoriesRepository;
    @Autowired
    private BookAuthorsRepository bookAuthorsRepository;
    @Autowired
    private ProductDiscountRepository productDiscountRepository;
    @Autowired
    private ProductReviewsRepository productReviewsRepository;
    @Autowired
    private BrandRepository brandRepository;
    @Autowired
    private Product_ImagesRepository productImagesRepository;
    @Autowired
    private ImportInvoiceDetailRepository importInvoiceDetailRep;
    @Autowired
    private InvoiceDetailsRepository invoiceDetailRepository;

    @GetMapping("/product-show")
    public ResponseEntity<Map<String, Object>> getDataProduct(
            @RequestParam(name = "categoryId", required = false) String categoryId,
            @RequestParam(name = "brandId", required = false) String brandId) {
        Map<String, Object> response = new HashMap<String, Object>();

        List<Product_Detail> productDetails;
        if (categoryId != null && brandId != null) {
            // Trường hợp: Lấy ProductDetail theo cả CategoryId và BrandId
            productDetails = productDetailRepository.findProductDetailsByCategoryAndBrand(categoryId, brandId);
        } else if (brandId != null) {
            // Trường hợp: Lấy ProductDetail theo BrandId
            productDetails = productDetailRepository.findProductDetailsByBrandId(brandId);
        } else if (categoryId != null) {
            // Trường hợp: Lấy ProductDetail theo CategoryId
            productDetails = productDetailRepository.findAllCate(categoryId);
        } else {
            // Trường hợp mặc định: Lấy tất cả ProductDetail
            productDetails = productDetailRepository.findAll();
        }

        List<CategoryTypes> listCategoryTypes = categoryTypesRepository.findAll();
        List<Categories> listCategories = categoriesRepository.findAll();
        List<Book_Authors> listBookAuthor = bookAuthorsRepository.findAll();
        List<Product_Discount> listProductDiscount = productDiscountRepository.findProductDiscountsByDate();
        List<Product_Reviews> listProductReviews = productReviewsRepository.findAll();
        List<Brands> listBrands = brandRepository.findAll();
        List<Product_Images> listProductImages = productImagesRepository.findAll();
        List<ImportInvoiceDetail> listImportInvoiceDetail = importInvoiceDetailRep.findAll();
        List<InvoiceDetails> listInvoiceDetails = invoiceDetailRepository.findAll();

        response.put("listProductDetail", productDetails);
        response.put("listInvoiceDetails", listInvoiceDetails);
        response.put("listImportInvoiceDetail", listImportInvoiceDetail);
        response.put("listCategoryTypes", listCategoryTypes);
        response.put("listCategories", listCategories);
        response.put("listBookAuthor", listBookAuthor);
        response.put("listProductDiscount", listProductDiscount);
        response.put("listProductReviews", listProductReviews);
        response.put("listBrands", listBrands);
        response.put("listProductImages", listProductImages);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/showQuicklist/{productDetailId}")
    public ResponseEntity<List<Product_Images>> getImageDetail(@PathVariable Integer productDetailId) {
        // Tìm danh sách hình ảnh dựa trên ProductDetailID
        List<Product_Images> productImages = productImagesRepository.findByProductDetail_ProductDetailId(productDetailId);

        if (productImages != null && !productImages.isEmpty()) {
            return ResponseEntity.ok(productImages);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}
