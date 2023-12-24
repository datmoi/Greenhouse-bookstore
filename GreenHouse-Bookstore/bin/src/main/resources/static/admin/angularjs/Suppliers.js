app.controller("SuppliersController", SuppliersController);


function SuppliersController($scope, $location, $routeParams, $http) {
    $scope.$on('$routeChangeSuccess', function (event, current, previous) {
        $scope.page.setTitle(current.$$route.title || ' Quản Lý nhà cung cấp');
        $scope.loadSuppliers();
    });

    $scope.editingSupplier = {};
    $scope.isEditing = false;
    $scope.suppliers = [];
    $scope.searchText = "";

    $scope.itemsPerPageOptions = [5, 12, 24, 32, 64, 128];
    let host = "http://localhost:8081/rest/suppliers";
    // Khai báo danh sách tùy chọn cho số mục trên mỗi trang
    $scope.selectedItemsPerPage = 5; // Khởi tạo giá trị mặc định cho số mục trên mỗi trang
    $scope.currentPage = 1; // Trang hiện tại
    $scope.itemsPerPage = 5; // Số mục hiển thị trên mỗi trang
    $scope.totalItems = $scope.suppliers.length; // Tổng số mục
    $scope.maxSize = 5; // Số lượng nút phân trang tối đa hiển thị
    $scope.orderByField = "";
    $scope.reverseSort = true;


    $scope.sortBy = function (field) {
        if ($scope.orderByField === field) {
            $scope.reverseSort = !$scope.reverseSort;
        } else {
            $scope.orderByField = field;
            $scope.reverseSort = true;
        }
    };
    // Hàm tính toán số trang dựa trên số lượng mục và số mục trên mỗi trang
    $scope.getNumOfPages = function () {
        return Math.ceil($scope.totalItems / $scope.itemsPerPage);
    };

    // Hàm chuyển đổi trang
    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.calculateRange = function () {
        var startIndex = ($scope.currentPage - 1) * $scope.itemsPerPage + 1;
        var endIndex = $scope.currentPage * $scope.itemsPerPage;

        if (endIndex > $scope.totalItems) {
            endIndex = $scope.totalItems;
        }

        return startIndex + ' đến ' + endIndex + ' trên tổng số ' + $scope.totalItems + ' mục';
    };

    // Load danh sách nhà cung cấp
    $scope.loadSuppliers = function () {
        var url = `${host}`;
        $http.get(url).then(resp => {
            $scope.originalSuppliers = $scope.suppliers;
            $scope.suppliers = resp.data;
            console.log("success", resp.data);
            $scope.totalItems = $scope.suppliers.length;
        }).catch(error => {
            console.log("Error", error);
        });
    }

    $scope.searchData = function () {
        // Lọc danh sách gốc bằng searchText
        $scope.suppliers = $scope.originalSuppliers.filter(function (supplier) {
            // Thực hiện tìm kiếm trong các thuộc tính cần thiết của item
            return (
                supplier.supplierId.toString().toLowerCase().includes($scope.searchText) || supplier.supplierName.toLowerCase().includes($scope.searchText.toLowerCase()) || supplier.email.toString().includes($scope.searchText) || supplier.phone.toString().includes($scope.searchText)
            );
        });
        $scope.totalItems = $scope.searchText ? $scope.suppliers.length : $scope.originalSuppliers.length;
        ;
        $scope.setPage(1);
    };

    // Lưu thông tin nhà cung cấp
    $scope.saveSupplier = function (supplierId) {
        $scope.errorMessages = {
            supplierId: '',
            supplierName: '',
            address: '',
            email: '',
            phone: ''
        };
        var formData = new FormData();
        var fileInput = document.getElementById("fileInput");

        var supplierId = $scope.editingSupplier.supplierId;
        var supplierName = $scope.editingSupplier.supplierName;
        var address = $scope.editingSupplier.address;
        var email = $scope.editingSupplier.email;
        var phone = $scope.editingSupplier.phone;

        // Kiểm tra bỏ trống mã nxb
        if (!supplierId) {
            $scope.errorMessages.supplierId = 'Vui lòng nhập mã nhà cung cấp';
            return;
        }
        // Kiểm tra bỏ trống tên nxb
        if (!supplierName) {
            $scope.errorMessages.supplierName = 'Vui lòng nhập tên nhà cung cấp';
            return;
        }
        // Kiểm tra bỏ trống nxb
        if (!address) {
            $scope.errorMessages.address = 'Vui lòng nhập địa chỉ nhà cung cấp';
            return;
        }
        // Kiểm tra bỏ trống nxb
        if (!email) {
            $scope.errorMessages.email = 'Vui lòng nhập email nhà cung cấp';
            return;
        }
        // Kiểm tra bỏ trống nxb
        if (!phone) {
            $scope.errorMessages.phone = 'Vui lòng nhập số điện thoại nhà cung cấp';
            return;
        }

        // Kiểm tra định dạng mã
        // var supllierIdRegex = /^[A-Z0-9]{4,}$/;
        // if (!supllierIdRegex.test(supplierId)) {
        //     $scope.errorMessages.supplierId = 'Mã nhà cung cấp phải chứa ít nhất 4 ký tự và chỉ được điền kí tự HOA và số';
        //     return;
        // }

        // Kiểm tra trùng lặp supplierId trước khi thêm
        if (!$scope.isEditing) {
            var existingSupplier = $scope.suppliers.find(function (supplier) {
                return supplier.supplierId === $scope.editingSupplier.supplierId;
            });

            if (existingSupplier) {
                // Gán thông báo lỗi vào $scope.errorMessages.supplierId
                $scope.errorMessages.supplierId = `Mã Nhà cung cấp "${$scope.editingSupplier.supplierId}" đã tồn tại. Vui lòng chọn mã khác.`;
                return; // Không tiếp tục lưu nếu có lỗi
            }
        }

        // Kiểm tra trùng lặp supplierName trước khi thêm
        var existingSupplierName = $scope.suppliers.find(function (supplier) {
            return (
                supplier.supplierName === $scope.editingSupplier.supplierName &&
                supplier.supplierId !== $scope.editingSupplier.supplierId
            );
        });
        if (existingSupplierName) {
            // Hiển thị thông báo lỗi nếu tên nhà cung cấp đã tồn tại
            $scope.errorMessages.supplierName = `Tên Nhà cung cấp "${$scope.editingSupplier.supplierName}" đã tồn tại. Vui lòng chọn tên khác.`;
            return; // Không tiếp tục lưu nếu có lỗi
        }

        // Kiểm tra định dạng email Gmail
        function isGmail(email) {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        }
        if (!isGmail($scope.editingSupplier.email)) {
            // Hiển thị thông báo lỗi nếu email không đúng định dạng Gmail
            $scope.errorMessages.email = `Email "${$scope.editingSupplier.email}" không đúng định dạng Gmail. Vui lòng kiểm tra lại.`;
            return; // Không tiếp tục lưu nếu có lỗi
        }

        // Kiểm tra trùng lặp email trước khi thêm
        var existingEmail = $scope.suppliers.find(function (supplier) {
            return (
                supplier.email === $scope.editingSupplier.email &&
                supplier.supplierId !== $scope.editingSupplier.supplierId
            );
        });
        if (existingEmail) {
            // Hiển thị thông báo lỗi nếu email đã tồn tại
            $scope.errorMessages.email = `Email "${$scope.editingSupplier.email}" đã tồn tại. Vui lòng chọn email khác.`;
            return; // Không tiếp tục lưu nếu có lỗi
        }


        // Kiểm tra trùng lặp số điện thoại trước khi thêm
        var existingPhoneNumber = $scope.suppliers.find(function (supplier) {
            return (
                supplier.phone === $scope.editingSupplier.phone &&
                supplier.supplierId !== $scope.editingSupplier.supplierId
            );
        });

        if (existingPhoneNumber) {
            // Hiển thị thông báo lỗi nếu số điện thoại đã tồn tại
            $scope.errorMessages.phone = `Số điện thoại "${$scope.editingSupplier.phone}" đã tồn tại. Vui lòng chọn số điện thoại khác.`;
            return; // Không tiếp tục lưu nếu có lỗi
        }


        // Hiển thị hiệu ứng loading
        var loadingOverlay = document.getElementById("loadingOverlay");
        loadingOverlay.style.display = "block";

        if (fileInput && fileInput.files.length > 0) {
            formData.append("image", fileInput.files[0]);
        }


        formData.append(
            "supplierJson",
            JSON.stringify({
                supplierId: $scope.editingSupplier.supplierId || "",
                supplierName: $scope.editingSupplier.supplierName || "",
                description: $scope.editingSupplier.description || "",
                address: $scope.editingSupplier.address || "",
                email: $scope.editingSupplier.email || "",
                phone: $scope.editingSupplier.phone || "", // Thêm trường phone
                image: $scope.editingSupplier.image || "",
            })
        );

        if ($scope.isEditing) {
            // Ẩn hiệu ứng loading khi lưu thành công
            loadingOverlay.style.display = "none";
            // Sử dụng hộp thoại xác nhận từ thư viện Swal
            Swal.fire({
                title: 'Xác nhận cập nhật',
                text: `Bạn có muốn cập nhật nhà cung cấp "${$scope.editingSupplier.supplierId}" không?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Cập nhật',
                cancelButtonText: 'Hủy',
            }).then((result) => {
                if (result.isConfirmed) {
                    // Hiển thị hiệu ứng loading khi người dùng xác nhận cập nhật
                    loadingOverlay.style.display = "block";
                    var url = `${host}/${$scope.editingSupplier.supplierId}`;
                    $http
                        .put(url, formData, {
                            transformRequest: angular.identity,
                            headers: {"Content-Type": undefined},
                        })
                        .then((resp) => {
                            // Ẩn hiệu ứng loading khi lưu thành công
                            loadingOverlay.style.display = "none";
                            $scope.loadSuppliers();
                            $scope.resetForm();
                            Swal.fire({
                                icon: "success",
                                title: "Thành công",
                                text: `Cập nhật nhà cung cấp "${supplierId}" thành công`,
                            });
                            $scope.clearImage(); // Xóa ảnh đại diện sau khi cập nhật
                        })
                        .catch((error) => {
                            // Ẩn hiệu ứng loading khi lưu thành công
                            loadingOverlay.style.display = "none";
                            Swal.fire({
                                icon: "error",
                                title: "Thất bại",
                                text: `Cập nhật nhà cung cấp "${supplierId}" thất bại`,
                            });
                        });
                } else {
                    // Nếu người dùng chọn "Hủy", bạn có thể thực hiện các hành động tùy ý hoặc không thực hiện gì cả.
                    // Ví dụ: không thực hiện cập nhật và trở lại biểu mẫu.
                }
            });
        } else {
            var url = `${host}`;
            $http.post(url, formData, {
                transformRequest: angular.identity,
                headers: {
                    "Content-Type": undefined,
                },
            })
                .then((resp) => {
                    // Ẩn hiệu ứng loading khi lưu thành công
                    loadingOverlay.style.display = "none";
                    $scope.loadSuppliers();
                    $scope.resetForm();
                    Swal.fire({
                        icon: "success",
                        title: "Thành công",
                        text: `Thêm nhà cung cấp "${supplierId}" thành công `,
                    });
                    $scope.clearImage(); // Xóa ảnh đại diện sau khi thêm
                })
                .catch((error) => {
                    // Ẩn hiệu ứng loading khi lưu thành công
                    loadingOverlay.style.display = "none";
                    console.log(error.data);
                    if (error.data) {
                        Swal.fire({
                            icon: "error",
                            title: "Thất bại",
                            text: `Thêm nhà cung cấp "${supplierId}" thất bại`,
                        });
                    }
                });
        }
    };

    // Chỉnh sửa thông tin nhà cung cấp và chuyển hướng
    $scope.editSupplierAndRedirect = function (supplierId) {
        var url = `${host}/${supplierId}`;
        $http
            .get(url)
            .then(function (resp) {
                $scope.editingSupplier = angular.copy(resp.data);
                $scope.isEditing = true;

                // Chuyển hướng đến trang chỉnh sửa thông tin nhà cung cấp và truyền dữ liệu nhà cung cấp.
                // Sử dụng $location.search để thiết lập tham số trong URL.
                $location
                    .path("/supplier-form")
                    .search({ id: supplierId, data: angular.toJson(resp.data) });
            })
            .catch(function (error) {
                console.log("Error", error);
            });
    };

    // Kiểm tra xem có tham số data trong URL không.
    if ($routeParams.data) {
        // Parse dữ liệu từ tham số data và gán vào editingSupplier.
        $scope.editingSupplier = angular.fromJson($routeParams.data);
        $scope.isEditing = true;
    }

    // Xóa nhà cung cấp
    $scope.deleteSupplier = function (supplierId) {
        Swal.fire({
            title: 'Xác nhận xóa',
            text: `Bạn có muốn xóa nhà cung cấp "${supplierId}" không?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
        }).then((result) => {
            if (result.isConfirmed) {
                var url = `${host}/${supplierId}`;
                $http
                    .delete(url)
                    .then(function (resp) {
                        if (resp.status === 200) {
                            $scope.loadSuppliers();
                            Swal.fire({
                                icon: "success",
                                title: "Thành công",
                                text: `Xóa ID ${supplierId} thành công `,
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Thất bại",
                                text: `Không thể xóa NCC ${supplierId} đang sử dụng `,
                            });
                        }
                    })
                    .catch(function (error) {
                        Swal.fire({
                            icon: "error",
                            title: "Thất bại",
                            text: `Xóa ID ${supplierId} thất bại `,
                        });
                    });
            }
        });
    };

    // Xóa ảnh đại diện và làm mới form
    $scope.clearImage = function () {
        $scope.editingSupplier.image = "/admin/assets/images/default.jpg"; // Xóa đường dẫn ảnh đại diện
        var imageElement = document.getElementById("uploadedImage");
        imageElement.src = "/admin/assets/images/default.jpg"; // Xóa hiển thị ảnh đại diện
        var fileInput = document.getElementById("fileInput");
        fileInput.value = null; // Đặt giá trị của input file thành null để xóa tệp đã chọn
    };

    // Làm mới form
    $scope.resetForm = function () {
        $scope.editingSupplier = {};
        $scope.isEditing = false;
        $scope.clearImage(); // Xóa ảnh đại diện khi làm mới form
        $location.search('id', null);
        $location.search('data', null);

        // Sau khi xóa, chuyển hướng lại đến trang /flashsale-form
        $location.path('/supplier-form');
    };

    $scope.exportToExcel = function () {
        // Lấy toàn bộ dữ liệu từ server khi tải trang ban đầu
        $scope.loadSuppliers();

        // Bây giờ, $scope.invoice sẽ chứa toàn bộ dữ liệu từ tất cả các trang

        // Tạo mảng dữ liệu cho tệp Excel
        var excelData = [
            ['BÁO CÁO - DANH SÁCH NHÀ CUNG CẤP'], // Header
            [], // Empty row for spacing
            ['#', 'ID', 'Tên nhà cung cấp', 'Mô tả', 'Địa chỉ', 'Email']
        ];

        $scope.suppliers.forEach(function (item, index) {
            excelData.push([
                index + 1,
                item.supplierId,
                item.supplierName,
                item.description,
                item.address,
                item.email,
            ]);
        });
        // Đặt độ rộng cố định cho từng cột
        var colWidths = [10, 15, 30, 50, 15, 20];

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
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách nhà cung cấp');

        // Xuất tệp Excel
        XLSX.writeFile(wb, 'danh_sach_nha_cung_cap.xlsx');
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


    $scope.printPDF = function () {
        var headerTable = {
            table: {
                headerRows: 1,
                widths: [30, 60, 100, 100, 80, 90],
                body: [
                    [{ text: '#', alignment: 'center', fontSize: 11 }, // Căn giữa cột '#'
                    { text: 'ID', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Mã hóa đơn'
                    { text: 'Tên nhà cung cấp', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Tên khách hàng'
                    { text: 'Mô tả', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Ngày tạo'
                    { text: 'Địa chỉ', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Tổng tiền'
                    { text: 'Email', alignment: 'center', fontSize: 11 }] // Căn giữa cột 'Phí ship'
                ]
            }
        };

        var bodyTable = {
            table: {
                widths: [30, 60, 100, 100, 80, 90],
                body: $scope.suppliers.map((item, index) => [
                    { text: (index + 1).toString(), alignment: 'center', fontSize: 11 }, // Đặt kích thước font cho cột '#'
                    { text: item.supplierId, alignment: 'center', fontSize: 11 }, // Đặt kích thước font cho cột 'Mã hóa đơn'
                    { text: item.supplierName, fontSize: 11 },
                    { text: item.description, fontSize: 11 }, // Không đặt kích thước font cho cột 'Tên khách hàng'
                    { text: item.address, fontSize: 11 },
                    { text: item.email, fontSize: 11 },
                ])
            }
        };

        var docDefinition = {
            pageOrientation: 'portrait',
            pageSize: 'A4',
            content: [
                { text: 'Danh sách nhà cung cấp', style: 'header' },
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
    $scope.loadSuppliers();
}
