app.controller("InventoryStatic", InventoryStatic);

function InventoryStatic($scope, $http, $filter) {
    let host = "http://localhost:8081/rest/inventory-static";
    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        $scope.page.setTitle(current.$$route.title || 'Thống kê hàng tồn kho');
        $scope.loadInventoryStatics();
    });
    $scope.editingInventoryStatics = {};
    $scope.isEditing = false;

    $scope.inventorystatics = [];
    $scope.inventorystaticsasc = [];
    $scope.searchText1 = "";
    $scope.searchText2 = "";
    $scope.categories = [];
    $scope.sortField = null;
    $scope.reverseSort = false;
    // Khai báo danh sách tùy chọn cho số mục trên mỗi trang
    $scope.itemsPerPageOptions1 = [5, 12, 24, 32, 64, 128];
    $scope.itemsPerPageOptions2 = [5, 12, 24, 32, 64, 128];
    $scope.selectedItemsPerPage1 = 5; // Khởi tạo giá trị mặc định cho số mục trên mỗi trang
    $scope.selectedItemsPerPage2 = 5;
    $scope.currentPage1 = 1;
    $scope.currentPage2 = 1;
    $scope.itemsPerPage1 = 5;
    $scope.itemsPerPage2 = 5;
    $scope.totalItems1 = $scope.inventorystatics.length;
    $scope.totalItems2 = $scope.inventorystaticsasc.length;
    $scope.maxSize1 = 5;
    $scope.reverseSort = false; // Sắp xếp tăng dần
    $scope.reverseSortTable2 = false; // Sắp xếp tăng dần

    // Sắp xếp
    $scope.sortBy = function (field) {
        if ($scope.sortField === field) {
            $scope.reverseSort = !$scope.reverseSort;
        } else {
            $scope.sortField = field;
            $scope.reverseSort = false;
        }
    };

    $scope.sortByTable2 = function (field) {
        if ($scope.sortField1 === field) {
            $scope.reverseSortTable2 = !$scope.reverseSortTable2;
        } else {
            $scope.sortField1 = field;
            $scope.reverseSortTable2 = false;
        }
    };

    $scope.getNumOfPages1 = function () {
        return Math.ceil($scope.totalItems1 / $scope.itemsPerPage1);
    };
    $scope.getNumOfPages2 = function () {
        return Math.ceil($scope.totalItems2 / $scope.itemsPerPage2);
    };

    // Hàm chuyển đổi trang
    $scope.setPage1 = function (pageNo) {
        $scope.currentPage1 = pageNo;
    };
    $scope.setPage2 = function (pageNo) {
        $scope.currentPage2 = pageNo;
    };

    $scope.calculateRange1 = function () {
        var startIndex1 = ($scope.currentPage1 - 1) * $scope.itemsPerPage1 + 1;
        var endIndex1 = $scope.currentPage1 * $scope.itemsPerPage1;

        if (endIndex1 > $scope.totalItems1) {
            endIndex1 = $scope.totalItems1;
        }

        return startIndex1 + ' đến ' + endIndex1 + ' trên tổng số ' + $scope.totalItems1 + ' mục';
    };
    $scope.calculateRange2 = function () {
        var startIndex2 = ($scope.currentPage2 - 1) * $scope.itemsPerPage2 + 1;
        var endIndex2 = $scope.currentPage2 * $scope.itemsPerPage2;

        if (endIndex2 > $scope.totalItems2) {
            endIndex2 = $scope.totalItems2;
        }

        return startIndex2 + ' đến ' + endIndex2 + ' trên tổng số ' + $scope.totalItems2 + ' mục';
    };
    $scope.loadInventoryStatics = function () {
        var url = `${host}`;
        $http.get(url).then(resp => {
            console.log("Response data:", resp.data);
            $scope.originaList1 = $scope.inventorystatics;
            $scope.inventorystatics = resp.data.list1;

            $scope.originaList2 = $scope.inventorystaticsasc;
            $scope.inventorystaticsasc = resp.data.list2;

            $scope.totalItems1 = $scope.inventorystatics.length;
            $scope.totalItems2 = $scope.inventorystaticsasc.length;
            // Rest of your code...
        })
            .catch(error => {
                console.log("Error", error);
            });
    };
    $scope.searchData1 = function () {
        // Lọc danh sách gốc bằng searchText
        $scope.inventorystatics = $scope.originaList1.filter(function (item) {
            // Thực hiện tìm kiếm trong các trường cần thiết của sản phẩm
            return (
                item[0].toString().includes($scope.searchText1) || // ID
                item[1].toLowerCase().includes($scope.searchText1.toLowerCase()) || // Tên sản phẩm
                item[2].toString().includes($scope.searchText1) || // Số lượng tồn kho
                item[3].toString().includes($scope.searchText1) || // Giá nhập
                item[4].toString().includes($scope.searchText1) || // Trạng thái tồn kho
                item[5].toString().includes($scope.searchText1) || // Tên thương hiệu
                new Date(item[6]).toLocaleDateString().includes($scope.searchText1) // Ngày sản xuất
            );
        });
        $scope.totalItems1 = $scope.searchText1 ? $scope.inventorystatics.length : $scope.originaList1.length;
        $scope.setPage1(1);
    };
    $scope.searchData2 = function () {
        // Lọc danh sách gốc bằng searchText2
        $scope.inventorystaticsasc = $scope.originaList2.filter(function (item) {
            // Thực hiện tìm kiếm trong các trường cần thiết của sản phẩm trong phần "desc"
            return (
                item[0].toString().includes($scope.searchText2) || // ID
                item[1].toLowerCase().includes($scope.searchText2.toLowerCase()) || // Tên sản phẩm
                item[2].toString().includes($scope.searchText2) || // Số lượng tồn kho
                item[3].toString().includes($scope.searchText2) || // Giá nhập
                item[4].toString().includes($scope.searchText2) || // Trạng thái tồn kho
                item[5].toString().includes($scope.searchText2) || // Tên thương hiệu
                new Date(item[6]).toLocaleDateString().includes($scope.searchText2) // Ngày sản xuất
            );
        });
        $scope.totalItems2 = $scope.searchText2 ? $scope.inventorystaticsasc.length : $scope.originaList2.length;
        $scope.setPage2(1);
    };

    // Lấy dữ liệu loại danh mục
    $http
        .get("/rest/categories")
        .then((resp) => {
            $scope.categories = resp.data;
        })
        .catch((Error) => {
            console.log("Error", Error);
        });

    // Lấy dữ liệu loại thương hiệu
    $http
        .get("/rest/brand")
        .then((resp) => {
            $scope.brands = resp.data;
        })
        .catch((Error) => {
            console.log("Error", Error);
        });

    $scope.Edit = function (key, index) {
        var url = `${host}/${key}`;
        $http
            .get(url)
            .then((resp) => {
                $scope.form = resp.data;
                $scope.selectedItemIndex = index; // Lưu chỉ số sản phẩm đang được chỉnh sửa
                displayImages(resp.data.image); // Hiển thị ảnh tương ứng cho sản phẩm đang chỉnh sửa
            })
            .catch((Error) => {
                console.log("Error", Error);
            });
    };
    //Xuất EXCEL1
    $scope.exportToExcel1 = function () {
        // Lấy toàn bộ dữ liệu từ server khi tải trang ban đầu
        $scope.loadInventoryStatics();

        // Bây giờ, $scope.invoice sẽ chứa toàn bộ dữ liệu từ tất cả các trang

        // Tạo mảng dữ liệu cho tệp Excel
        var excelData = [
            ['BÁO CÁO - DANH SÁCH SẢN PHẨM TỒN TRONG KHO'], // Header
            [], // Empty row for spacing
            ['#', 'ID', 'Tên sản phẩm', 'Số lượng tồn', 'Gía nhập', 'Trạng thái', 'Thương hiệu', 'Ngày sản xuất']
        ];

        $scope.inventorystatics.forEach(function (item, index) {
            excelData.push([
                index + 1,
                item[0],
                item[1],
                item[2],
                item[3],
                convertStatusToText(item[4]), // Chuyển đổi giá trị bool thành văn bản
                item[5],
                $filter('date')(item[6], 'dd/MM/yyyy')
            ]);
        });
        // Đặt độ rộng cố định cho từng cột
        var colWidths = [10, 10, 50, 15, 15, 15, 15, 15];

        // Sử dụng thư viện XLSX để tạo tệp Excel
        var ws = XLSX.utils.aoa_to_sheet(excelData);

        // Đặt độ rộng cố định cho các cột
        for (var i = 0; i < colWidths.length; i++) {
            ws['!cols'] = ws['!cols'] || [];
            ws['!cols'].push({ wch: colWidths[i] });
        }

        // Căn giữa dữ liệu trong từng cột
        for (var row = 0; row < excelData.length; row++) {
            for (var col = 0; col < excelData[row].length; col++) {
                ws[XLSX.utils.encode_cell({ r: row, c: col })].s = { alignment: { horizontal: 'center' } };
            }
        }

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách sản phẩm tồn kho');

        // Xuất tệp Excel
        XLSX.writeFile(wb, 'danh_sach_san_pham_ton_kho.xlsx');
    }


    // Định nghĩa hàm formatDate để định dạng ngày in
    function formatDate(date) {
        var options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        };
        return date.toLocaleString('en-US', options);
    }


    $scope.printPDF1 = function () {
        var headerTable = {
            table: {
                headerRows: 1,
                widths: [20, 30, 110, 60, 60, 40, 60, 60],
                body: [
                    [{ text: '#', alignment: 'center', fontSize: 11 }, // Căn giữa cột '#'
                    { text: 'ID', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Mã hóa đơn'
                    { text: 'Tên sản phảm', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Tên khách hàng'
                    { text: 'Số lượng tồn', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Ngày tạo'
                    { text: 'Gía nhập', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Tổng tiền'
                    { text: 'Trạng thái', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Phí ship'
                    { text: 'Thương hiệu', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Tiền thanh toán'
                    { text: 'Ngày sản xuất', alignment: 'center', fontSize: 11 }] // Căn giữa cột 'Ngày thanh toán'
                ]
            }
        };

        bodyTable = {
            table: {
                widths: [20, 30, 110, 60, 60, 40, 60, 60],
                body: $scope.inventorystatics.map((item, index) => [
                    { text: (index + 1).toString(), alignment: 'center', fontSize: 11 },
                    { text: item[0], alignment: 'center', fontSize: 11 },
                    { text: item[1], fontSize: 11 },
                    { text: item[2], alignment: 'center', fontSize: 11 },
                    { text: item[3], alignment: 'center', fontSize: 11 },
                    { text: convertStatusToText(item[4]), alignment: 'center', fontSize: 11 }, // Chuyển đổi giá trị bool thành văn bản
                    { text: item[5], alignment: 'center', fontSize: 11 },
                    { text: $filter('date')(item[6], 'dd/MM/yyyy'), alignment: 'center', fontSize: 11 }
                ])
            }
        };

        var docDefinition = {
            pageOrientation: 'portrait',
            pageSize: 'A4',
            content: [
                { text: 'Danh sách hàng hóa tồn kho', style: 'header' },
                ' ',
                { text: 'Ngày in: ' + moment().format('DD/MM/YYYY'), alignment: 'right', fontSize: 12 },
                ' ',
                headerTable,
                bodyTable
            ],
            styles: {
                header: { fontSize: 16, bold: true, alignment: 'center' },
                default: { fontSize: 14 }
            }
        };

        pdfMake.createPdf(docDefinition).open();
    };
    //Xuất EXCEL 2
    $scope.exportToExcel2 = function () {
        // Lấy toàn bộ dữ liệu từ server khi tải trang ban đầu
        $scope.loadInventoryStatics();

        // Bây giờ, $scope.invoice sẽ chứa toàn bộ dữ liệu từ tất cả các trang

        // Tạo mảng dữ liệu cho tệp Excel
        var excelData = [
            ['BÁO CÁO - DANH SÁCH SẢN PHẨM SẮP HẾT'], // Header
            [], // Empty row for spacing
            ['#', 'ID', 'Tên sản phẩm', 'Số lượng tồn', 'Gía nhập', 'Trạng thái', 'Thương hiệu', 'Ngày sản xuất']
        ];

        $scope.inventorystaticsasc.forEach(function (item, index) {
            excelData.push([
                index + 1,
                item[0],
                item[1],
                item[2],
                item[3],
                convertStatusToText(item[4]), // Chuyển đổi giá trị bool thành văn bản
                item[5],
                $filter('date')(item[6], 'dd/MM/yyyy')
            ]);
        });
        // Đặt độ rộng cố định cho từng cột
        var colWidths = [10, 10, 50, 15, 15, 15, 15, 15];

        // Sử dụng thư viện XLSX để tạo tệp Excel
        var ws = XLSX.utils.aoa_to_sheet(excelData);

        // Đặt độ rộng cố định cho các cột
        for (var i = 0; i < colWidths.length; i++) {
            ws['!cols'] = ws['!cols'] || [];
            ws['!cols'].push({ wch: colWidths[i] });
        }

        // Căn giữa dữ liệu trong từng cột
        for (var row = 0; row < excelData.length; row++) {
            for (var col = 0; col < excelData[row].length; col++) {
                ws[XLSX.utils.encode_cell({ r: row, c: col })].s = { alignment: { horizontal: 'center' } };
            }
        }

        var wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách sản phẩm sắp hết');

        // Xuất tệp Excel
        XLSX.writeFile(wb, 'danh_sach_san_pham_sap_het.xlsx');
    }

    $scope.printPDF2 = function () {
        var headerTable = {
            table: {
                headerRows: 1,
                widths: [20, 30, 110, 60, 60, 40, 60, 60],
                body: [
                    [{ text: '#', alignment: 'center', fontSize: 11 }, // Căn giữa cột '#'
                    { text: 'ID', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Mã hóa đơn'
                    { text: 'Tên sản phảm', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Tên khách hàng'
                    { text: 'Số lượng tồn', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Ngày tạo'
                    { text: 'Gía nhập', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Tổng tiền'
                    { text: 'Trạng thái', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Phí ship'
                    { text: 'Thương hiệu', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Tiền thanh toán'
                    { text: 'Ngày sản xuất', alignment: 'center', fontSize: 11 }] // Căn giữa cột 'Ngày thanh toán'
                ]
            }
        };

        bodyTable = {
            table: {
                widths: [20, 30, 110, 60, 60, 40, 60, 60],
                body: $scope.inventorystaticsasc.map((item, index) => [
                    { text: (index + 1).toString(), alignment: 'center', fontSize: 11 },
                    { text: item[0], alignment: 'center', fontSize: 11 },
                    { text: item[1], fontSize: 11 },
                    { text: item[2], alignment: 'center', fontSize: 11 },
                    { text: item[3], alignment: 'center', fontSize: 11 },
                    { text: convertStatusToText(item[4]), alignment: 'center', fontSize: 11 }, // Chuyển đổi giá trị bool thành văn bản
                    { text: item[5], alignment: 'center', fontSize: 11 },
                    { text: $filter('date')(item[6], 'dd/MM/yyyy'), alignment: 'center', fontSize: 11 }
                ])
            }
        };

        var docDefinition = {
            pageOrientation: 'portrait',
            pageSize: 'A4',
            content: [
                { text: 'Danh sách hàng hóa sắp hết', style: 'header' },
                ' ',
                { text: 'Ngày in: ' + moment().format('DD/MM/YYYY'), alignment: 'right', fontSize: 12 },
                ' ',
                headerTable,
                bodyTable
            ],
            styles: {
                header: { fontSize: 16, bold: true, alignment: 'center' },
                default: { fontSize: 14 }
            }
        };

        pdfMake.createPdf(docDefinition).open();
    };
    // Thêm hàm để chuyển đổi giá trị boolean sang văn bản
    function convertStatusToText(status) {
        return status ? "Đang bán" : "Ngừng bán";
    }
    $scope.loadInventoryStatics();
}
