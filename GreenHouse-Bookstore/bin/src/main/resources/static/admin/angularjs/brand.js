app.controller("brandController", function ($scope, $location, $routeParams, $http) {
    $scope.editingBrand = {};
    $scope.isEditing = false;

    $scope.brands = [];
    $scope.searchText = "";

    $scope.itemsPerPageOptions = [5, 12, 24, 32, 64, 128];
    let host = "http://localhost:8081/rest/brand";
    $scope.selectedItemsPerPage = 5; // Khởi tạo giá trị mặc định cho số mục trên mỗi trang
    $scope.currentPage = 1; // Trang hiện tại
    $scope.itemsPerPage = 5; // Số mục hiển thị trên mỗi trang
    $scope.totalItems = $scope.brands.length; // Tổng số mục
    $scope.maxSize = 5; // Số lượng nút phân trang tối đa hiển thị
    $scope.reverseSort = false; // Sắp xếp tăng dần
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

    $scope.loadBrand = function () {
        var url = `${host}`;
        $http.get(url).then(resp => {
            $scope.brands = resp.data;
            $scope.originalbrands = $scope.brands;

            console.log("success", resp.data);
            $scope.totalItems = $scope.brands.length;
        }).catch(error => {
            console.log("Error", error);
        });
    }

    $scope.searchData = function () {
        // Lọc danh sách gốc bằng searchText
        $scope.brands = $scope.originalbrands.filter(function (brand) {
            // Thực hiện tìm kiếm trong các thuộc tính cần thiết của item
            return (
                brand.brandId.toString().toLowerCase().includes($scope.searchText) || brand.brandName.toLowerCase().includes($scope.searchText.toLowerCase())
            );
        });
        $scope.totalItems = $scope.searchText ? $scope.brands.length : $scope.originalbrands.length;
        ;
        $scope.setPage(1);
    };


    $scope.saveBrand = function () {
        // Reset error messages
        $scope.errorMessages = {
            brandId: '',
            brandName: '',
            countryOfOrigin: ''
        };

        var formData = new FormData();
        var fileInput = document.getElementById("fileInput");
        var brandId = $scope.editingBrand.brandId;
        var brandName = $scope.editingBrand.brandName;
        var countryOfOrigin = $scope.editingBrand.countryOfOrigin;

        // Kiểm tra BrandId
        if (!brandId) {
            $scope.errorMessages.brandId = 'Vui lòng không bỏ trống thông tin thương hiệu';
            return;
        }

        // Kiểm tra BrandName
        if (!brandName) {
            $scope.errorMessages.brandName = 'Vui lòng không bỏ trống thông tin tên thương hiệu';
            return;
        }

        // Kiểm tra CountryOfOrigin
        if (!countryOfOrigin) {
            $scope.errorMessages.countryOfOrigin = 'Vui lòng không bỏ trống thông tin nơi xuất xứ';
            return;
        }

           // Hiển thị hiệu ứng loading
           var loadingOverlay = document.getElementById("loadingOverlay");
           loadingOverlay.style.display = "block";

        if (fileInput && fileInput.files.length > 0) {
            formData.append("image", fileInput.files[0]);
        }

        formData.append("brandJson", JSON.stringify({
            brandId: brandId,
            brandName: brandName,
            countryOfOrigin: countryOfOrigin,
            logo: $scope.editingBrand.logo || ""
        }));

        var url = $scope.isEditing ? `${host}/${brandId}` : host;

    $http({
        method: $scope.isEditing ? 'PUT' : 'POST',
        url: url,
        data: formData,
        headers: {
            'Content-Type': undefined
        },
        transformRequest: angular.identity
    })
    .then(function (resp) {
        console.log(resp);
                  // Ẩn hiệu ứng loading khi lưu thành công
                  loadingOverlay.style.display = "none";
        $scope.loadBrand();
        $scope.resetForm();
        var action = $scope.isEditing ? 'Cập nhật' : 'Thêm';
        showSuccess(`${action} thương hiệu ${resp.data.brandId}`);
        $scope.clearImage();
    })
    .catch(function (error) {
                  // Ẩn hiệu ứng loading khi lưu thành công
                  loadingOverlay.style.display = "none";
        var action = $scope.isEditing ? 'Cập nhật' : 'Thêm';
        showError(`${action} thương hiệu thất bại`);
    });
};
    


    $scope.checkDuplicateBrandId = function (brandId) {
        // Kiểm tra trùng lặp username
        var existingbrandId = $scope.brand.find(function (brand) {
            return brand.brandId === brandId;
        });

        if (existingbrandId) {
            showError("ID thương hiệu đã tồn tại.");
            return true; // Đã tồn tại
        }

        return false; // Chưa tồn tại
    };


    $scope.editBrandAndRedirect = function (brandId) {
        var url = `${host}/${brandId}`;
        $http.get(url)
        .then(function (resp) {
            $scope.editingBrand = angular.copy(resp.data);
            $scope.isEditing = true;
            $location.path("/brand-form").search({ id: brandId, data: resp.data }).replace();
        })
        .catch(function (error) {
            console.log("Error", error);
        });
    };

    // Kiểm tra xem có tham số data trong URL không.
    if ($routeParams.data) {
        // Parse dữ liệu từ tham số data và gán vào editingBrand.
        $scope.editingBrand = angular.fromJson($routeParams.data);
        $scope.isEditing = true;
    }

    $scope.deleteBrand = function (brandId) {
        var url = `${host}/${brandId}`;
        Swal.fire({
            title: "Bạn chắc chắn?",
            text: "Dữ liệu sẽ bị xóa vĩnh viễn.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Xác nhận",
            cancelButtonText: "Hủy",
        }).then((result) => {
            if (result.isConfirmed) {
                // Sử dụng $http để gửi yêu cầu DELETE đến API
                $http.delete(url)
                    .then(function (resp) {
                        if (resp.status === 200) {
                            $scope.loadBrand();
                            Swal.fire({
                                icon: "success",
                                title: "Thành công",
                                text: `Xóa ID ${brandId} thành công `,
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Thất bại",
                                text: `Không thể xóa thương hiệu ${brandId} đang sử dụng `,
                            });
                        }
                    })
                    .catch(function (error) {
                        Swal.fire({
                            icon: "error",
                            title: "Thất bại",
                            text: `Xóa ID ${brandId} thất bại `,
                        });
                    });
            }
        });
    };


    $scope.resetForm = function () {
        // Kiểm tra xem có tham số "id" và "data" trong URL không, và nếu có thì xóa chúng
        if ($location.search().id || $location.search().data) {
            $location.search('id', null);
            $location.search('data', null);
        }

        // Gán giá trị cho editingBrand và isEditing
        $scope.editingBrand = {};
        $scope.isEditing = false;

        // Chuyển hướng lại đến trang /brand-form
        $location.path('/brand-form');
        $scope.clearImage();
    };


    $scope.clearImage = function () {
        $scope.editingBrand.logo = "/admin/assets/images/default.jpg"; // Xóa đường dẫn ảnh đại diện
        var imageElement = document.getElementById("uploadedImage");
        imageElement.src = "/admin/assets/images/default.jpg"; // Xóa hiển thị ảnh đại diện
        var fileInput = document.getElementById("fileInput");
        fileInput.value = null; // Đặt giá trị của input file thành null để xóa tệp đã chọn
    };

    $scope.loadBrand();
});


// Hiển thị ảnh tải lên khi chọn tệp
function displayImage(event) {
    var imageElement = document.getElementById("uploadedImage");
    var fileInput = event.target;

    if (fileInput.files && fileInput.files[0]) {
        var reader = new FileReader();

        reader.onload = function (e) {
            imageElement.src = e.target.result;
        };

        reader.readAsDataURL(fileInput.files[0]);
    }
}