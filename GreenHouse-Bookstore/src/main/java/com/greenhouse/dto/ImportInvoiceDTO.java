package com.greenhouse.dto;

import java.util.List;
import java.util.Optional;

import com.greenhouse.model.ImportInvoice;
import com.greenhouse.model.ImportInvoiceDetail;


import lombok.Data;

@Data
public class ImportInvoiceDTO {
    private ImportInvoice importInvoice;
    private List<ImportInvoiceDetail> importInvoiceDetails;
    private Optional<List<ImportInvoiceDetail>> deletedImportInvoiceDetails;
}
