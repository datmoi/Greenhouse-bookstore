package com.greenhouse.restcontroller.admin;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.google.gson.Gson;
import com.greenhouse.dto.ProductDTO;
import com.greenhouse.model.Attribute_Value;
import com.greenhouse.model.Book_Authors;
import com.greenhouse.model.ProductPriceHistories;
import com.greenhouse.model.Product_Category;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Product_Images;
import com.greenhouse.model.Products;
import com.greenhouse.service.AttributeValueService;
import com.greenhouse.service.BookAuthorsService;
import com.greenhouse.service.ProductCategoryService;
import com.greenhouse.service.ProductDetailService;
import com.greenhouse.service.ProductImagesService;
import com.greenhouse.service.ProductPriceHistoriesService;
import com.greenhouse.service.ProductsService;
import com.greenhouse.util.ImageUploader;

@RestController
@RequestMapping(value = "/rest/products")
public class RestProductCtrl {

    @Autowired
    private ProductsService productsService;

    @Autowired
    private ProductCategoryService productCategoryService;

    @Autowired
    private BookAuthorsService bookAuthorsService;

    @Autowired
    private ProductDetailService productDetailService;

    @Autowired
    private ProductImagesService productImagesService;

    @Autowired
    private AttributeValueService attributeValueService;

    @Autowired
    private ProductPriceHistoriesService productPriceHistoriesService;
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<List<Products>> getAllProducts() {
        List<Products> products = productsService.findAll();
        // Lọc ra chỉ các sản phẩm đang kinh doanh (chưa bị xóa mềm)
        List<Products> activeProducts = products.stream()
                .filter(product -> product.getDeleteAt() == null)
                .collect(Collectors.toList());
        return new ResponseEntity<>(activeProducts, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<List<Products>> create(
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "file", required = false) MultipartFile[] files,
            @RequestParam(value = "dataJson") String dataJson) throws Exception {

        if (dataJson.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        String photoUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            photoUrl = ImageUploader.uploadImage(imageFile, "product_details" + System.currentTimeMillis());
        }

        ProductDTO data = new Gson().fromJson(dataJson, ProductDTO.class);

        Products existingProduct = productsService.findById(data.getProduct().getProductId());
        if (existingProduct != null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
        Products createdProduct = productsService.add(data.getProduct());

        Product_Category productCategory = new Product_Category();
        productCategory.setProduct(createdProduct);
        productCategory.setCategory(data.getCategory());
        productCategoryService.add(productCategory);

        Book_Authors bookAuthor = new Book_Authors();

        // Kiểm tra nếu setAuthor không phải là null mới thêm bookAuthor
        if (data.getAuthor() != null) {
            bookAuthor.setProduct(createdProduct);
            bookAuthor.setAuthor(data.getAuthor());
            bookAuthorsService.add(bookAuthor);
        } else {
            // Xử lý khi setAuthor là null (nếu cần)
            System.out.println("Author is null. Book_Authors not added.");
        }

        data.getProductDetail().setProduct(createdProduct);
        if (photoUrl != null) {
            data.getProductDetail().setImage(photoUrl);
        }
        Product_Detail productDetail = productDetailService.add(data.getProductDetail());
        ProductPriceHistories productPriceHistories = new ProductPriceHistories();
        productPriceHistories.setProductDetail(productDetail);
        productPriceHistories.setPriceNew(productDetail.getPrice());
        productPriceHistories.setTimeChange(new Date());

        productPriceHistoriesService.add(productPriceHistories);

        List<Product_Images> savedImages = new ArrayList<>();

        if (files != null && files.length > 0) {
            // Tải lên nhiều tệp hình ảnh lên Cloudinary
            List<String> cloudinaryUrls = ImageUploader.uploadImagesToCloudinary(files,
                    "productImages_" + System.currentTimeMillis());

            for (String cloudinaryUrl : cloudinaryUrls) {
                // Tạo đối tượng Product_Images và lưu thông tin
                Product_Images pdImages = new Product_Images();
                pdImages.setImage(cloudinaryUrl); // Lưu URL thật của ảnh
                pdImages.setProductDetail(productDetail);

                // Lưu đối tượng Product_Images vào cơ sở dữ liệu
                productImagesService.add(pdImages);

                savedImages.add(pdImages);
            }
        }
        // Lưu giá trị thuộc tính vào bảng AttributeValue và liên kết với productDetail
        for (Attribute_Value attributeValue : data.getAttributeValues()) {
            attributeValue.setAttribute(attributeValue.getAttribute());
            attributeValue.setValue(attributeValue.getValue());
            attributeValue.setProductDetail(productDetail);
            attributeValueService.add(attributeValue);

        }
        // Sau khi tạo sản phẩm thành công, gửi thông báo đến client sử dụng WebSocket
        messagingTemplate.convertAndSend("/topic/products", "update");

        List<Products> updatedProducts = productsService.findAll();
        return new ResponseEntity<>(updatedProducts, HttpStatus.OK);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<List<Products>> updateProduct(@PathVariable String productId,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "file", required = false) MultipartFile[] files, // Chấp nhận nhiều hình ảnh
            @RequestParam(value = "dataJson") String dataJson) throws Exception {

        if (dataJson.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        ProductDTO data = new Gson().fromJson(dataJson, ProductDTO.class);

        Products existingProduct = productsService.findById(productId);
        if (existingProduct == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        String photoUrl = null;
        if (imageFile != null && !imageFile.isEmpty()) {
            photoUrl = ImageUploader.uploadImage(imageFile, "product_details" + System.currentTimeMillis());
        }

        // Update existing product details
        existingProduct.setProductName(data.getProduct().getProductName());
        existingProduct.setDescription(data.getProduct().getDescription());
        existingProduct.setManufactureDate(data.getProduct().getManufactureDate());
        existingProduct.setStatus(data.getProduct().isStatus());
        existingProduct.setUpdateAt(new Date());

        // Update brand and publisher
        existingProduct.setBrand(data.getProduct().getBrand());
        existingProduct.setPublisher(data.getProduct().getPublisher());
        productsService.update(existingProduct);

        // Update or create Book_Authors entry
        Book_Authors existingBookAuthors = bookAuthorsService.findByProduct(existingProduct);
        if (existingBookAuthors == null) {
            // If no entry exists, create a new one
            existingBookAuthors = new Book_Authors();
            existingBookAuthors.setProduct(existingProduct);
        }

        existingBookAuthors.setAuthor(data.getAuthor());
        bookAuthorsService.update(existingBookAuthors);

        Product_Category existingProductCategory = productCategoryService.findByProduct(existingProduct);
        if (existingProductCategory == null) {
            existingProductCategory = new Product_Category();
            existingProductCategory.setProduct(existingProduct);
        }
        existingProductCategory.setCategory(data.getCategory());
        productCategoryService.update(existingProductCategory);

        // Lấy productDetail cũ liên kết với product
        List<Product_Detail> existingProductDetails = productDetailService.findByProduct(existingProduct);

        // Kiểm tra xem có productDetail cũ hay không
        if (existingProductDetails.isEmpty()) {
            // Nếu không có productDetail cũ, tạo mới và liên kết với sản phẩm
            Product_Detail newProductDetail = new Product_Detail();
            newProductDetail.setProduct(existingProduct);
            newProductDetail.setImage(photoUrl);
            existingProductDetails.add(newProductDetail);
        }

        // Chọn productDetail cần cập nhật (có thể chọn theo logic cụ thể của bạn)
        Product_Detail existingProductDetail = existingProductDetails.get(0);

        // Update thông tin của productDetail
        existingProductDetail.setPrice(data.getProductDetail().getPrice());
        existingProductDetail.setPriceDiscount(data.getProductDetail().getPriceDiscount());
        existingProductDetail.setQuantityInStock(data.getProductDetail().getQuantityInStock());
        existingProductDetail.setWeight(data.getProductDetail().getWeight());
        existingProductDetail.setHeight(data.getProductDetail().getHeight());
        existingProductDetail.setLength(data.getProductDetail().getLength());
        existingProductDetail.setWidth(data.getProductDetail().getWidth());

        if (photoUrl != null) {
            existingProductDetail.setImage(photoUrl);
        }
        // Lưu productDetail đã cập nhật
        productDetailService.update(existingProductDetail);

        ProductPriceHistories exPriceHistories = productPriceHistoriesService
                .findByProductDetail(existingProductDetail);
        if (exPriceHistories == null) {
            exPriceHistories = new ProductPriceHistories();
            exPriceHistories.setProductDetail(existingProductDetail);
        }
        double priceOld = exPriceHistories.getPriceNew();

        exPriceHistories.setPriceOld(priceOld);
        exPriceHistories.setPriceNew(existingProductDetail.getPrice());
        exPriceHistories.setTimeChange(new Date());

        productPriceHistoriesService.update(exPriceHistories);

        if (files != null && files.length > 0) {
            // Tải lên và lưu ảnh mới lên Cloudinary
            List<String> cloudinaryUrls = ImageUploader.uploadImagesToCloudinary(files,
                    "productImages-update" + System.currentTimeMillis());
            // Lấy danh sách ảnh cũ liên kết với productDetail
            List<Product_Images> existingImages = productImagesService.findByProductDetail(existingProductDetail);

            for (String cloudinaryUrl : cloudinaryUrls) {
                // Tạo đối tượng Product_Images và lưu thông tin
                Product_Images pdImages = new Product_Images();
                pdImages.setImage(cloudinaryUrl); // Lưu URL thật của ảnh
                pdImages.setProductDetail(existingProductDetail);

                // Lưu đối tượng Product_Images vào cơ sở dữ liệu
                productImagesService.update(pdImages);

                existingImages.add(pdImages);
            }
        }

        for (Attribute_Value attributeValue : data.getAttributeValues()) {
            // Nếu id của attributeValue đã tồn tại, thì cập nhật
            if (attributeValue.getId() != 0) {
                Attribute_Value existingAttributeValue = attributeValueService.findById(attributeValue.getId());
                if (existingAttributeValue != null) {
                    if (attributeValue.getAttribute() != null) {
                        existingAttributeValue.setAttribute(attributeValue.getAttribute());
                    }
                    existingAttributeValue.setValue(attributeValue.getValue());
                    attributeValueService.update(existingAttributeValue);
                }
            } else {
                // Ngược lại, tạo mới attributeValue và liên kết với productDetail
                if (attributeValue.getAttribute() != null) {
                    attributeValue.setAttribute(attributeValue.getAttribute());
                }
                attributeValue.setValue(attributeValue.getValue());
                attributeValue.setProductDetail(existingProductDetail);
                attributeValueService.add(attributeValue);
            }
        }
        // Sau khi tạo sản phẩm thành công, gửi thông báo đến client sử dụng WebSocket
        messagingTemplate.convertAndSend("/topic/products", "update");

        // System.out.println(dataJson);

        // Get the updated product information
        List<Products> updatedProducts = productsService.findAll();
        return new ResponseEntity<>(updatedProducts, HttpStatus.OK);
    }

    @PatchMapping("/{productId}/toggleStatus")
    public ResponseEntity<List<Products>> toggleProductStatus(@PathVariable String productId) {
        Products existingProduct = productsService.findById(productId);
        if (existingProduct == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Chuyển đổi trạng thái của sản phẩm (đang kinh doanh -> ngừng kinh doanh và
        // ngược lại)
        existingProduct.setStatus(!existingProduct.isStatus());
        productsService.update(existingProduct);

        List<Products> updatedProducts = productsService.findAll();
        return new ResponseEntity<>(updatedProducts, HttpStatus.OK);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<List<Products>> softDeleteProduct(@PathVariable String productId) {
        Products existingProduct = productsService.findById(productId);
        if (existingProduct == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        // Kiểm tra sản phẩm đã xóa mềm hay chưa
        if (existingProduct.getDeleteAt() != null) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST); // Hoặc bạn có thể trả về OK nếu đã xóa mềm để giảm
            // tiêu tốn băng thông
        }

        // Thực hiện xóa mềm
        existingProduct.setDeleteAt(new Date());
        existingProduct.setDeleteBy("Admin"); // Thay thế bằng người dùng thực hiện xóa mềm

        productsService.update(existingProduct);

        List<Products> updatedProducts = productsService.findAll();
        return new ResponseEntity<>(updatedProducts, HttpStatus.OK);
    }

    @PostMapping(value = "/import")
    public ResponseEntity<Object> importProducts(@RequestParam("file") MultipartFile file) {
        try {
            // Gọi phương thức service để xử lý việc nhập danh sách từ file Excel
            List<Products> importedProducts = productsService.importProducts(file);

            return new ResponseEntity<>(importedProducts, HttpStatus.OK);
        } catch (IOException e) {
            e.printStackTrace();
            return new ResponseEntity<>("Lỗi khi đọc file Excel", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
