package com.greenhouse.service.impl;

import com.greenhouse.model.Brands;
import com.greenhouse.model.Product_Detail;
import com.greenhouse.model.Products;
import com.greenhouse.model.Publishers;
import com.greenhouse.repository.BrandRepository;
import com.greenhouse.repository.ProductsRepository;
import com.greenhouse.repository.PublishersRepository;
import com.greenhouse.service.ProductCategoryService;
import com.greenhouse.service.ProductDetailService;
import com.greenhouse.service.ProductsService;
import org.apache.poi.ss.usermodel.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;
import java.util.Optional;
import java.text.ParseException;
import java.util.Date;

@Service
public class ProductsServiceImpl implements ProductsService {

    @Autowired
    private ProductsRepository productsRepository;
    @Autowired
    private BrandRepository brandRepository;
    @Autowired
    private PublishersRepository publishersRepository;
    @Autowired
    private ProductDetailService productDetailService;

    @Override
    public List<Products> findAll() {
        return productsRepository.findAll();
    }

    @Override
    public Products findById(String productId) {
        Optional<Products> result = productsRepository.findById(productId);
        return result.orElse(null);
    }

    @Override
    public Products add(Products product) {
        return productsRepository.save(product);
    }

    @Override
    public Products update(Products product) {
        return productsRepository.save(product);
    }

    @Override
    public void delete(String productId) {
        productsRepository.deleteById(productId);
    }

    @Override
    public List<Products> importProducts(MultipartFile file) throws IOException {
        List<Products> importedProducts = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            // Bỏ qua dòng tiêu đề (header)
            Iterator<Row> rowIterator = sheet.iterator();
            rowIterator.next();

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                Products product = createProductFromRow(row);

                if (product != null) {
                    // Kiểm tra xem đối tượng đã tồn tại hay chưa dựa trên productId
                    boolean exists = productsRepository.existsById(product.getProductId());

                    if (!exists) {
                        // Nếu đối tượng chưa tồn tại, lưu mới
                        importedProducts.add(product);
                    }
                    // Nếu đối tượng đã tồn tại, bỏ qua
                }
            }
        }

        return productsRepository.saveAll(importedProducts);
    }

    private Products createProductFromRow(Row row) {
        Products product = new Products();

        try {
            // Đọc dữ liệu từ từng ô trong dòng và thiết lập giá trị cho đối tượng Products
            Cell cell;

            // Mã Sản Phẩm (cột 0)
            cell = row.getCell(0, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
            if (cell.getCellType() == CellType.NUMERIC) {
                product.setProductId(String.valueOf((int) cell.getNumericCellValue()));
            } else if (cell.getCellType() == CellType.STRING) {
                product.setProductId(cell.getStringCellValue());
            }

            // Tên Sản Phẩm (cột 1)
            cell = row.getCell(1, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
            product.setProductName(cell.getStringCellValue());

            // Brand Name (cột 2)
            cell = row.getCell(2, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
            String brandName = cell.getStringCellValue();

            // Kiểm tra xem brand đã tồn tại trong cơ sở dữ liệu chưa
            Optional<Brands> existingBrand = brandRepository.findByBrandName(brandName);
            Brands brand;
            if (existingBrand.isPresent()) {
                brand = existingBrand.get();
            } else {
                // Nếu brand chưa tồn tại, tạo mới và lưu vào cơ sở dữ liệu
                brand = new Brands();
                brand.setBrandName(brandName);
                brandRepository.save(brand);
            }
            product.setBrand(brand);

            // Publisher Name (cột 3)
            cell = row.getCell(3, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
            String publisherName = cell.getStringCellValue();

            // Kiểm tra xem publisher đã tồn tại trong cơ sở dữ liệu chưa
            Optional<Publishers> existingPublisher = publishersRepository.findByPublisherName(publisherName);
            Publishers publisher;
            if (existingPublisher.isPresent()) {
                publisher = existingPublisher.get();
            } else {
                // Nếu publisher chưa tồn tại, tạo mới và lưu vào cơ sở dữ liệu
                publisher = new Publishers();
                publisher.setPublisherName(publisherName);
                publishersRepository.save(publisher);
            }
            product.setPublisher(publisher);

            Products products = productsRepository.save(product);
            // Kiểm tra xem productDetail đã tồn tại trong cơ sở dữ liệu chưa
            boolean productDetailExists = productDetailService.existsByProduct(product);
            if (!productDetailExists) {
                // Nếu productDetail chưa tồn tại, lưu mới
                Product_Detail productDetail = createProductDetailFromRow(row, products);
                productDetailService.add(productDetail);
            }
            // Nếu productDetail đã tồn tại, bỏ qua

            // Các thuộc tính khác tương tự

            return product;
        } catch (Exception e) {
            // Xử lý ngoại lệ ở đây
            e.printStackTrace(); // Hoặc log thông báo lỗi theo cách phù hợp với ứng dụng của bạn
            return null; // Hoặc thực hiện xử lý khác tùy thuộc vào yêu cầu của bạn
        }
    }

    private Product_Detail createProductDetailFromRow(Row row, Products product) {
        Product_Detail productDetail = new Product_Detail();

        try {
            // Giá sản phẩm (cột 4)
            Cell cell = row.getCell(4, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
            double price = cell.getNumericCellValue();
            productDetail.setPrice(price);

            // Số Lượng (cột 5)
            cell = row.getCell(5, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
            if (cell.getCellType() == CellType.NUMERIC) {
                productDetail.setQuantityInStock((int) cell.getNumericCellValue());
            } else if (cell.getCellType() == CellType.STRING) {
                productDetail.setQuantityInStock(Integer.parseInt(cell.getStringCellValue()));
            }

            // Ảnh Sản Phẩm (cột 6)
            cell = row.getCell(6, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
            String image = cell.getStringCellValue();
            productDetail.setImage(image);

            // Thiết lập quan hệ giữa Product và ProductDetail
            productDetail.setProduct(product);

            // Các thuộc tính khác tương tự

            return productDetail;
        } catch (Exception e) {
            // Xử lý ngoại lệ ở đây
            e.printStackTrace(); // Hoặc log thông báo lỗi theo cách phù hợp với ứng dụng của bạn
            return null; // Hoặc thực hiện xử lý khác tùy thuộc vào yêu cầu của bạn
        }
    }

}
