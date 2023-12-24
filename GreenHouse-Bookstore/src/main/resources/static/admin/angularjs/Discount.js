app.controller("DiscountController", function ($scope, $location, $routeParams, $http, $filter) {
    $scope.page.setTitle("Quản Lý Giảm Giá");

    let host = "http://localhost:8081/rest/discounts";
    $scope.editingDiscount = {};
    $scope.isEditing = false;
    $scope.discounts = [];
    $scope.filteredDiscounts = [];
    $scope.errors = "";
    $scope.searchText = "";
    $scope.noResults = false;
    $scope.orderByField = "";
    $scope.reverseSort = true;
    $scope.itemsPerPageOptions = [5, 10, 20, 50];
    $scope.itemsPerPage = 5;
    $scope.currentPage = 1;
    $scope.maxSize = 5; // Số lượng nút phân trang tối đa hiển thị


    // Thêm chức năng xuất file Excel
    $scope.exportToExcel = function () {
        // Tạo một mảng dữ liệu để chứa dữ liệu cần xuất
        var dataToExport = [];
        dataToExport.push(["Mã Giảm Giá", "Ngày Bắt Đầu", "Ngày Kết Thúc", "Giá Trị Giảm Giá", "Số Lượng Sử Dụng", "Tổng Số Lượng", "Trạng Thái"]);

        // Thêm dữ liệu từ danh sách giảm giá vào mảng dữ liệu
        angular.forEach($scope.filteredDiscounts, function (dis) {
            dataToExport.push([dis.discountId, $filter('date')(dis.startDate, 'dd/MM/yyyy'), $filter('date')(dis.endDate, 'dd/MM/yyyy '), dis.value, dis.usedQuantity, dis.quantity, dis.active ? 'Đã sử dụng' : 'Chưa sử dụng']);
        });

        // Tạo một đối tượng workbook từ dữ liệu
        var wb = XLSX.utils.book_new();
        var ws = XLSX.utils.aoa_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, 'Discounts');

        // Xuất file Excel
        XLSX.writeFile(wb, 'Discounts.xlsx');
    };

    $scope.importDiscounts = function () {
        var fileInput = document.getElementById('fileInputExcel');
        var file = fileInput.files[0];
    
        if (!file) {
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Vui lòng chọn file Excel.",
            });
            return;
        }

        var fileType = file.type;
        if (fileType !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
            fileType !== "application/vnd.ms-excel") {
            // Bắt lỗi khi định dạng không đúng
            Swal.fire({
                icon: "error",
                title: "Lỗi",
                text: "Định dạng file Excel không đúng. Vui lòng chọn lại.",
            });
            return;
        }
    
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = new Uint8Array(e.target.result);
                var workbook = XLSX.read(data, { type: 'array' });
    
                // Kiểm tra tên cột ở đây
                var sheet = workbook.Sheets[workbook.SheetNames[0]];
                var expectedColumns = ["Mã Giảm Giá", "Ngày Bắt Đầu", "Ngày Kết Thúc", "Giá Trị Giảm Giá", "Số Lượng Sử Dụng", "Tổng Số Lượng", "Trạng Thái"];
                var headers = [];
                for (var key in sheet) {
                    if (key[0] === '!') continue;
                    if (key[1] === '1') {
                        headers.push(sheet[key].v.trim()); // Sử dụng trim để loại bỏ khoảng trắng ở đầu và cuối
                    } else {
                        break; // Chỉ kiểm tra dòng đầu tiên
                    }
                }
    
                var isValid = angular.equals(expectedColumns, headers);
                if (!isValid) {
                    Swal.fire({
                        icon: "error",
                        title: "Lỗi",
                        text: "Tên cột không đúng. Vui lòng kiểm tra lại file Excel.",
                    });
                    return;
                }
    
                // Tiếp tục với post request nếu tên cột đúng
                var formData = new FormData();
                formData.append('file', file);
    
                $http.post('http://localhost:8081/rest/discounts/import', formData, {
                    transformRequest: angular.identity,
                    headers: { 'Content-Type': undefined }
                })
                .then(function (response) {
                    console.log('Import successful', response);
                    $scope.loadDiscounts();
                })
                .catch(function (error) {
                    console.error('Import failed', error);
                });
            };
    
            reader.readAsArrayBuffer(file);
        }
    };


    $scope.selectedFileName = "";  // Thêm biến này vào $scope

$scope.openFileInput = function () {
    var fileInput = document.getElementById('fileInputExcel');
    fileInput.click();  // Kích hoạt sự kiện click trực tiếp từ mã nguồn

    // Cập nhật tên file đã chọn
    fileInput.addEventListener('change', function () {
        $scope.selectedFileName = fileInput.files[0].name;
        $scope.$apply();  // Cập nhật scope để hiển thị ngay lập tức
    });
};

$scope.clearSelectedFile = function () {
    $scope.selectedFileName = "";
    // Đặt giá trị input file thành rỗng để có thể chọn lại cùng một file
    document.getElementById('fileInputExcel').value = "";
};

    
 

    $scope.loadDiscounts = function () {
        var url = `${host}`;
        $http
            .get(url)
            .then((resp) => {
                $scope.discounts = resp.data;
                $scope.searchData();
            })
            .catch((error) => {
                console.log("Error", error);
            });
    };

    $scope.checkErrors = function () {
        $scope.errors = {};

        if (!$scope.editingDiscount.startDate) {
            $scope.errors.startDate = 'Vui lòng chọn ngày bắt đầu.';
        }

        if (!$scope.editingDiscount.endDate) {
            $scope.errors.endDate = 'Vui lòng chọn ngày kết thúc.';
        }


        if (!$scope.editingDiscount.value || $scope.editingDiscount.value < 1) {
            $scope.errors.value = 'Giá trị phải lớn hơn hoặc bằng 1.';
        }

        if (!$scope.editingDiscount.quantity || $scope.editingDiscount.quantity < 1 || $scope.editingDiscount.quantity > 100) {
            $scope.errors.quantity = 'Tổng số lượng phải nằm trong khoảng từ 1 đến 100.';
        }

        if ($scope.editingDiscount.startDate && $scope.editingDiscount.endDate) {
            var start = new Date($scope.editingDiscount.startDate);
            var end = new Date($scope.editingDiscount.endDate);
            if (start >= end) {
                $scope.errors.startDate = 'Ngày bắt đầu phải nhỏ hơn ngày kết thúc.';
                $scope.errors.endDate = 'Ngày kết thúc phải lớn hơn ngày bắt đầu.';
            }
        }

        var hasErrors = Object.keys($scope.errors).length > 0;

        return !hasErrors;
    };


    $scope.hideError = function (startDate) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[startDate] = '';

    };


    $scope.hideError = function (endDate) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[endDate] = '';

    };
    $scope.hideError = function (value) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[value] = '';

    };
    $scope.hideError = function (quantity) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[quantity] = '';

    };

    $scope.searchData = function () {
        $scope.filteredDiscounts = $filter("filter")(
            $scope.discounts,
            $scope.searchText
        );
        $scope.noResults = $scope.filteredDiscounts.length === 0;
    };

    $scope.sortBy = function (field) {
        if ($scope.orderByField === field) {
            $scope.reverseSort = !$scope.reverseSort;
        } else {
            $scope.orderByField = field;
            $scope.reverseSort = true;
        }
    };

    $scope.calculateRange = function () {
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var end = Math.min(
            start + $scope.itemsPerPage,
            $scope.filteredDiscounts.length
        );
        return start + 1 + "-" + end + " của " + $scope.filteredDiscounts.length;
    };

    function generateDiscountId() {
        const prefix = "210";
        const randomNumbers = Math.floor(Math.random() * 1000);
        return prefix + String(randomNumbers).padStart(3, "0");
    }

    $scope.saveDiscount = function () {
        if (!$scope.editingDiscount.discountId) {
            $scope.editingDiscount.discountId = generateDiscountId();
        }
        if (!$scope.checkErrors()) {
            return;
        }

        var discount = {
            discountId: $scope.editingDiscount.discountId,
            value: $scope.editingDiscount.value || 0,
            startDate: $scope.editingDiscount.startDate || null,
            endDate: $scope.editingDiscount.endDate || null,
            quantity: $scope.editingDiscount.quantity || 0,
            usedQuantity: $scope.editingDiscount.usedQuantity || 0,
            active: $scope.editingDiscount.active = false,
        };

        if ($scope.isEditing) {
            var url = `${host}/${discount.discountId}`;
            $http
                .put(url, discount)
                .then((resp) => {
                    $scope.loadDiscounts();
                    $scope.resetForm();
                    Swal.fire({
                        icon: "success",
                        title: "Thành công",
                        text: `Cập nhật giảm giá ${discount.discountId}`,
                    });
                })
                .catch((error) => {
                    Swal.fire({
                        icon: "error",
                        title: "Thất bại",
                        text: `Cập nhật giảm giá ${discount.discountId} thất bại`,
                    });
                });
        } else {
            var url = `${host}`;
            $http
                .post(url, discount)
                .then((resp) => {
                    $scope.loadDiscounts();
                    $scope.resetForm();
                    Swal.fire({
                        icon: "success",
                        title: "Thành công",
                        text: `Thêm giảm giá ${discount.discountId}`,
                    });
                })
                .catch((error) => {
                    Swal.fire({
                        icon: "error",
                        title: "Thất bại",
                        text: `Thêm giảm giá thất bại`,
                    });
                });
        }
    };

    $scope.editDiscountAndRedirect = function (discountId) {
        var url = `${host}/${discountId}`;
        $http
            .get(url)
            .then(function (resp) {
                $scope.editingDiscount = angular.copy(resp.data);
                $scope.editingDiscount.startDate = new Date($scope.editingDiscount.startDate);
                $scope.editingDiscount.endDate = new Date($scope.editingDiscount.endDate);
                $scope.editingDiscount.active = String($scope.editingDiscount.active);
                $scope.isEditing = true;

                $location.path("/discount-form").search({ id: discountId, data: angular.toJson(resp.data) });
            })
            .catch(function (error) {
                console.log("Error", error);
            });
    };

    if ($routeParams.data) {
        $scope.editingDiscount = angular.fromJson($routeParams.data);
        $scope.editingDiscount.startDate = new Date($scope.editingDiscount.startDate);
        $scope.editingDiscount.endDate = new Date($scope.editingDiscount.endDate);
        $scope.editingDiscount.active = String($scope.editingDiscount.active);
        $scope.isEditing = true;
    }

    $scope.deleteDiscount = function (discountId) {
        Swal.fire({
            title: "Xóa Giảm Giá?",
            text: "Bạn có chắc chắn muốn xóa giảm giá này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        }).then((result) => {
            if (result.isConfirmed) {
                var url = `${host}/${discountId}`;
                $http
                    .delete(url)
                    .then(function (resp) {
                        if (resp.status === 200) {
                            $scope.loadDiscounts();
                            Swal.fire({
                                icon: "success",
                                title: "Thành công",
                                text: `Xóa giảm giá ${discountId} thành công`,
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Thất bại",
                                text: `Không thể xóa giảm giá ${discountId} vì có khóa ngoại với các dữ liệu khác.`,
                            });
                        }
                    })
                    .catch(function (error) {
                        Swal.fire({
                            icon: "error",
                            title: "Thất bại",
                            text: `Xóa giảm giá ${discountId} thất bại`,
                        });
                    });
            }
        });
    };


    $scope.resetForm = function () {
        $scope.editingDiscount = {};
        $scope.isEditing = false;
    };

    $scope.loadDiscounts();
});
