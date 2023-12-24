app.controller('inventoryCtrl', inventoryCtrl);

function inventoryCtrl($scope, $http, jwtHelper, $location, $routeParams, $interval, $filter) {
    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        $scope.page.setTitle(current.$$route.title || ' Quản lý Kho Hàng');
        $scope.getData();
    });
    let host = "http://localhost:8081/rest";

    //khai báo biến
    $scope.listImportInvoice = [];
    $scope.listSuppliers = [];
    $scope.currentDateTime = moment();
    $scope.formattedDateTime = $scope.currentDateTime.format('DD/MM/YYYY HH:mm A');
    //biến trả về
    $scope.searchProductResults = [];
    $scope.listProductDetailsResult = [];

    // DECLARE REQUEST DATA - START
    $scope.selectedProducts = [];

    //Khai báo biến phân trang
    $scope.searchText = "";
    $scope.itemsPerPageOptions = [5, 12, 24, 32, 64, 128];
    $scope.currentPage = 1; // Trang hiện tại
    $scope.itemsPerPage = 12; // Số mục hiển thị trên mỗi trang
    $scope.totalItems = $scope.listImportInvoice.length; // Tổng số mục
    $scope.maxSize = 5; // Số lượng nút phân trang tối đa hiển thị
    $scope.reverseSort = false; // Sắp xếp tăng dần

    $scope.form = {
        importInvoiceId: null,
        username: null,
        suppliers: { supplierId: null },
        description: null,
        importInvoiceAmount: 0,
    }

    $scope.deletedImportInvoiceDetails = [];
    // DECLARE REQUEST DATA - END

    $scope.searchProductKeyword = null;
    // Hàm SEARCH CHUNG
    // Hàm tính toán số trang dựa trên số lượng mục và số mục trên mỗi trang
    $scope.getNumOfPages = function () {
        return Math.ceil($scope.totalItems / $scope.itemsPerPage);
    };

    // Hàm chuyển đổi trang
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    // Sắp xếp
    $scope.sortBy = function (field) {
        if ($scope.sortField === field) {
            $scope.reverseSort = !$scope.reverseSort;
        } else {
            $scope.sortField = field;
            $scope.reverseSort = false;
        }
    };

    $scope.calculateRange = function () {
        var startIndex = ($scope.currentPage - 1) * $scope.itemsPerPage + 1;
        var endIndex = $scope.currentPage * $scope.itemsPerPage;

        if (endIndex > $scope.totalItems) {
            endIndex = $scope.totalItems;
        }

        return startIndex + ' đến ' + endIndex + ' trên tổng số ' + $scope.totalItems + ' mục';
    };

    $scope.searchData = function () {
        // Lọc danh sách gốc bằng searchText
        $scope.listImportInvoice = $scope.originalImportInvoiceList.filter(function (item) {
            // Thực hiện tìm kiếm trong các thuộc tính cần thiết của item
            return (
                item.importInvoiceId.toString().includes($scope.searchText) || item.username.toLowerCase().includes($scope.searchText.toLowerCase())
                || (item.suppliers.supplierName.toLowerCase().includes($scope.searchText.toLowerCase())) ||
                (item.createDate && item.createDate.toString().includes($scope.searchText.toLowerCase())) ||
                item.description.toLowerCase().includes($scope.searchText.toLowerCase())
            );
        });
        $scope.totalItems = $scope.searchText ? $scope.listImportInvoice.length : $scope.originalImportInvoiceList.length;
        $scope.setPage(1);
    };
    //End Search
    // Hàm Save
    $scope.saveImportInvoice = function (active) {
        var check = $scope.checkErrors();
        if (check) {
            $scope.createDateFormat = moment();

            var supplier = $scope.listSuppliers.find(e => {
                return e.supplierId === $scope.form.suppliers.supplierId;
            })

            var importInvoiceDTO = {
                importInvoice: {
                    importInvoiceId: $scope.form.importInvoiceId | null,
                    username: $scope.form.username,
                    createDate: new Date(),
                    amount: $scope.form.importInvoiceAmount,
                    suppliers: supplier,
                    description: $scope.form.description,
                    status: active
                },
                importInvoiceDetails: $scope.selectedProducts,
                deletedImportInvoiceDetails: $scope.deletedImportInvoiceDetails
            };

            console.log(importInvoiceDTO);

            $http.post(`${host}/importInvoice`, importInvoiceDTO)
                .then(function (response) {
                    $scope.getData();
                    Swal.fire({
                        icon: "success",
                        title: "Thành công",
                        text: `Thêm Phiếu Nhập thành công`,
                    });
                    $scope.resetForm();
                    console.log('Dữ liệu đã được lưu thành công.', response);
                })
                .catch(function (error) {
                    Swal.fire({
                        icon: "error",
                        title: "Thất bại",
                        text: `Thêm Phiếu Nhập thất bại`,
                    });
                    console.error('Lỗi khi gửi dữ liệu: ', error);
                });
        }
    };

    $scope.edit = function (id) {
        var url = `${host}/importInvoiceEdit/${id}`;
        $http
            .get(url)
            .then(function (resp) {
                $scope.selectedProducts = angular.fromJson(resp.data.selectedProducts);

                $scope.form = resp.data.importInvoice;
                console.log($scope.form.status);
                console.log($scope.form);
                $scope.calculateTotal();
            })
            .catch(function (error) {
                console.log("Error", error);
            });
    };

    $scope.resetForm = function () {
        $scope.form = {
            importInvoiceId: null,
            username: $scope.username,
            suppliers: { supplierId: null },
            description: null,
            importInvoiceAmount: 0,
        }
        $scope.selectedProducts = [];
    };

    $scope.resetInventoryModal = function () {
        $scope.selectedProducts = [];
        $scope.deletedImportInvoiceDetails = [];
        $scope.resetForm();
    };


    $('#inventoryModal').on('hidden.bs.modal', function () {
        $scope.$apply(function () {
            console.log('Modal đã đóng lại');
            $scope.resetInventoryModal();
        });
    });

    $scope.checkErrors = function () {
        $scope.errors = {};

        var supplier = $scope.form.suppliers.supplierId;
        var description = $scope.form.description;

        if (!supplier) {
            $scope.errors.supplierId = 'Vui lòng chọn nhà cung cấp';
        }

        if (!description) {
            $scope.errors.description = 'Vui lòng nhập ghi chú';
        }

        if (!$scope.selectedProducts || $scope.selectedProducts.length === 0) {
            $scope.errors.products = 'Vui lòng chọn ít nhất một sản phẩm';
        }
        // Kiểm tra nếu có bất kỳ lỗi nào xuất hiện
        var hasErrors = Object.keys($scope.errors).length > 0;
        return !hasErrors
    };

    $scope.getData = function () {

        var url = `${host}/getInventory`;
        $http.get(url).then((resp) => {
            $scope.listSuppliers = resp.data.suppliers;
            $scope.originalImportInvoiceList = resp.data.listImportInvoice;
            $scope.listImportInvoice = $scope.originalImportInvoiceList;

            $scope.listProductDetails = resp.data.listProductDetails;
            $scope.listImportInvoice.sort(function (a, b) {
                return new Date(b.createDate) - new Date(a.createDate);
            });
            console.log("", resp.data.listImportInvoice)
            $scope.loadModelProduct();
            $scope.totalItems = $scope.originalImportInvoiceList.length; // Tổng số mục
        }).catch((Error) => {
            console.log("Error: ", Error);
        });
    }

    $scope.loadModelProduct = function () {
        $scope.listProductDetailsResult = [];
        $scope.listProductDetails.filter(function (item) {
            if (item.product.status === true) {
                $scope.listProductDetailsResult.push(item);
            }
        });
        console.log("Danh sách sản phẩm có status = 1:", $scope.listProductDetailsResult);

    }

    $scope.searchProduct = function (keyword) {
        $scope.searchProductResults = [];
        if (keyword) {
            keyword = keyword.toLowerCase();
            $scope.listProductDetailsResult.forEach(function (productD) {
                if (productD.product.productName.toLowerCase().includes(keyword)) {
                    $scope.searchProductResults.push(productD);
                }
            });
        } else {
            $scope.searchProductKeyword = null;
        }
    };

    $scope.selectedProduct = function (product) {
        var cart = {
            productDetail: product,
            quantity: 1,
            price: 0,
            amount: 0,
        };
        var duplicateProduct = true;
        $scope.selectedProducts.forEach(function (p) {
            if (p.productDetail.productDetailId == product.productDetailId) {
                p.quantity++;
                duplicateProduct = false;
            }
        })

        if (duplicateProduct) {
            $scope.selectedProducts.push(cart);
        }
        console.log("Sản phẩm đã chọn: ", $scope.selectedProducts);
        $scope.searchProduct(null);
    }

    $scope.calculateTotal = function () {
        $scope.form.importInvoiceAmount = 0;
        $scope.selectedProducts.forEach(e => {
            $scope.form.importInvoiceAmount += e.price * e.quantity;
        });

    };

    $scope.removeProduct = function (index) {
        $scope.deletedImportInvoiceDetails.push($scope.selectedProducts[index]);
        $scope.selectedProducts.splice(index, 1);
        $scope.calculateTotal();
    };

    function init() {
        var token = localStorage.getItem('token');
        if (token) {
            var decodedToken = jwtHelper.decodeToken(token);
            $scope.username = decodedToken.sub;
            $scope.form.username = $scope.username;
            console.log("username:", $scope.username);
        }

        $interval(function () {
            $scope.currentDateTime = moment();
            $scope.formattedDateTime = $scope.currentDateTime.format('DD/MM/YYYY HH:mm A');
            console.log("update time");
        }, 60000);


    }
    $scope.exportToExcel = function () {
        // Lấy toàn bộ dữ liệu từ server khi tải trang ban đầu
        $scope.getData();

        // Bây giờ, $scope.listImportInvoice sẽ chứa toàn bộ dữ liệu từ tất cả các trang

        // Tạo mảng dữ liệu cho tệp Excel
        var excelData = [
            ['BÁO CÁO - DANH SÁCH HÀNG HÓA TRONG KHO'], // Header
            [], // Empty row for spacing
            ['#', 'ID', 'Username', 'Ngày Tạo', 'Tổng Tiền', 'Nhà Cung Cấp', 'Mô Tả']
        ];

        // Sử dụng $filter để định dạng ngày
        var dateFilter = $filter('date');

        $scope.listImportInvoice.forEach(function (item, index) {
            excelData.push([
                index + 1,
                item.importInvoiceId,
                item.username,
                dateFilter(item.createDate, 'dd/MM/yyyy'),
                $filter('number')(item.amount, 0),
                item.suppliers.supplierName,
                item.description // Điền mô tả
            ]);
        });

        // Đặt độ rộng cố định cho từng cột
        var colWidths = [10, 10, 30, 30, 30, 50, 50];

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
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách hàng hóa trong kho');

        // Xuất tệp Excel
        XLSX.writeFile(wb, 'danh_sach_hang_hoa_trong_kho.xlsx');
    }


    // Định nghĩa hàm formatDate để định dạng ngày in
    function formatDate(date) {
        var day = date.getDate();
        var month = date.getMonth() + 1;
        var year = date.getFullYear();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();

        // Định dạng thời gian thành chuỗi 'HH:mm:ss'
        var time = [hours, minutes, seconds].map(function (unit) {
            return (unit < 10 ? '0' : '') + unit;
        }).join(':');

        // Định dạng ngày thành chuỗi 'dd/MM/yyyy'
        var formattedDate = [(day < 10 ? '0' : '') + day, (month < 10 ? '0' : '') + month, year].join('/');

        return formattedDate + ' ' + time;
    }

    $scope.printPDF = function () {
        var headerTable = {
            table: {
                headerRows: 1,
                widths: [20, 20, 70, 70, 60, 90, 120],
                body: [
                    [{ text: '#', alignment: 'center', fontSize: 11 }, // Căn giữa cột '#'
                    { text: 'ID', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Mã hóa đơn'
                    { text: 'Username', alignment: 'center', fontSize: 11 },
                    { text: 'Ngày Tạo', alignment: 'center', fontSize: 11 },
                    { text: 'Tổng Tiền', alignment: 'center', fontSize: 11 },
                    { text: 'Nhà Cung Cấp', alignment: 'center', fontSize: 11 },
                    { text: 'Mô Tả', alignment: 'center', fontSize: 11 },
                    ]
                ]
            }
        };

        var bodyTable = {
            table: {
                widths: [20, 20, 70, 70, 60, 90, 120],
                body: $scope.listImportInvoice.map((item, index) => [
                    { text: (index + 1).toString(), alignment: 'center', fontSize: 11 },
                    { text: item.importInvoiceId, alignment: 'center', fontSize: 11 },
                    { text: item.username,  fontSize: 11 },
                    { text: moment(item.createDate).format('DD/MM/YYYY'), alignment: 'center', fontSize: 11 }, // Định dạng ngày thành 'dd/mm/yyyy' ở đây
                    { text: item.amount, fontSize: 11 },
                    { text: item.suppliers.supplierName, fontSize: 11 },
                    { text: item.description, fontSize: 11 }
                ])
            }
        };

        var docDefinition = {
            pageOrientation: 'portrait',
            pageSize: 'A4',
            content: [
                { text: 'Danh sách hàng hóa trong kho', style: 'header' },
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


    // Gọi hàm callback để kiểm tra và sử dụng jwtHelper
    init();

}