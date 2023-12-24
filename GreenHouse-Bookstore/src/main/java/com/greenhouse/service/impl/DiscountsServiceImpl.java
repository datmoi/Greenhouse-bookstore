package com.greenhouse.service.impl;

import com.greenhouse.model.Discounts;
import com.greenhouse.repository.DiscountsRepository;
import com.greenhouse.service.DiscountsService;
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
public class DiscountsServiceImpl implements DiscountsService {

    @Autowired
    private DiscountsRepository discountsRepository;

    @Override
    public List<Discounts> findAll() {
        return discountsRepository.findAll();
    }

    @Override
    public Discounts findById(Integer discountId) {
        Optional<Discounts> result = discountsRepository.findById(discountId);
        return result.orElse(null);
    }

    @Override
    public Discounts add(Discounts discounts) {
        return discountsRepository.save(discounts);
    }

    @Override
    public Discounts update(Discounts discounts) {
        return discountsRepository.save(discounts);
    }

    @Override
    public void delete(Integer discountId) {
        discountsRepository.deleteById(discountId);
    }

    @Override
    public List<Discounts> importDiscounts(MultipartFile file) throws IOException {
        List<Discounts> importedDiscounts = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);

            // Bỏ qua dòng tiêu đề (header)
            Iterator<Row> rowIterator = sheet.iterator();
            rowIterator.next();

            while (rowIterator.hasNext()) {
                Row row = rowIterator.next();
                Discounts discount = createDiscountFromRow(row);
                if (discount != null) {
                    // Kiểm tra xem đối tượng đã tồn tại hay chưa dựa trên discountId
                    boolean exists = discountsRepository.existsById(discount.getDiscountId());

                    if (!exists) {
                        // Nếu đối tượng chưa tồn tại, lưu mới
                        importedDiscounts.add(discount);
                    }
                    // Nếu đối tượng đã tồn tại, bỏ qua
                }
            }
        }

        return discountsRepository.saveAll(importedDiscounts);
    }

    private Discounts createDiscountFromRow(Row row) {
        Discounts discount = new Discounts();

        // Đọc dữ liệu từ từng ô trong dòng và thiết lập giá trị cho đối tượng Discounts
        Cell cell;

        // Mã Giảm Giá (cột 0)
        cell = row.getCell(0, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
        if (cell.getCellType() == CellType.NUMERIC) {
            discount.setDiscountId((int) cell.getNumericCellValue());
        } else if (cell.getCellType() == CellType.STRING) {
            discount.setDiscountId(Integer.parseInt(cell.getStringCellValue()));
        }

        // Ngày Bắt Đầu (cột 1)
        cell = row.getCell(1, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
        if (cell.getCellType() == CellType.NUMERIC) {
            discount.setStartDate(cell.getDateCellValue());
        } else if (cell.getCellType() == CellType.STRING) {
            discount.setStartDate(parseDate(cell.getStringCellValue()));
        }

        // Ngày Kết Thúc (cột 2)
        cell = row.getCell(2, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
        if (cell.getCellType() == CellType.NUMERIC) {
            discount.setEndDate(cell.getDateCellValue());
        } else if (cell.getCellType() == CellType.STRING) {
            discount.setEndDate(parseDate(cell.getStringCellValue()));
        }

        // Giá Trị Giảm Giá (cột 3)
        cell = row.getCell(3, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
        if (cell.getCellType() == CellType.NUMERIC) {
            discount.setValue((int) cell.getNumericCellValue());
        } else if (cell.getCellType() == CellType.STRING) {
            discount.setValue(Integer.parseInt(cell.getStringCellValue()));
        }

        // Số Lượng Sử Dụng (cột 4)
        cell = row.getCell(4, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
        if (cell.getCellType() == CellType.NUMERIC) {
            discount.setUsedQuantity((int) cell.getNumericCellValue());
        } else if (cell.getCellType() == CellType.STRING) {
            discount.setUsedQuantity(Integer.parseInt(cell.getStringCellValue()));
        }

        // Tổng Số Lượng (cột 5)
        cell = row.getCell(5, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
        if (cell.getCellType() == CellType.NUMERIC) {
            discount.setQuantity((int) cell.getNumericCellValue());
        } else if (cell.getCellType() == CellType.STRING) {
            discount.setQuantity(Integer.parseInt(cell.getStringCellValue()));
        }

        // Trạng Thái (cột 6)
        cell = row.getCell(6, Row.MissingCellPolicy.CREATE_NULL_AS_BLANK);
        if (cell.getCellType() == CellType.BOOLEAN) {
            discount.setActive(cell.getBooleanCellValue());
        } else if (cell.getCellType() == CellType.STRING) {
            discount.setActive(Boolean.parseBoolean(cell.getStringCellValue()));
        }

        return discount;
    }

    private Date parseDate(String dateString) {
        SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");
        try {
            return dateFormat.parse(dateString);
        } catch (ParseException e) {
            e.printStackTrace(); // hoặc xử lý lỗi theo nhu cầu của bạn
            return null;
        }
    }

}
