app.controller("ProductDiscountController", function ($scope, $http, $filter) {
    $scope.page.setTitle("Quản Lý Giảm Giá Sản Phẩm");

    let host = "http://localhost:8081/rest/product_discount";
    $scope.editingDiscount = {};
    $scope.isEditing = false;
    $scope.discounts = [];
    $scope.productDiscounts = [];
    $scope.productDetails = [];
    $scope.itemsPerPageOptions = [5, 10, 20, 50];
    $scope.itemsPerPage = 5;
    $scope.currentPage = 1;
    $scope.maxSize = 5; // Số lượng nút phân trang tối đa hiển thị
    $scope.showProductTable = false; // Biến này sẽ kiểm soát trạng thái ẩn/hiện của bảng sản phẩm
    $scope.filterProductDetails = [];
    $scope.filterProductDiscounts = [];
    $scope.errors = "";




    $scope.checkErrors = function () {
        $scope.errors = {};

        if (!$scope.editingDiscount.discount) {
            $scope.errors.value = 'Vui lòng chọn phần trăm giảm.';
        }

        // Kiểm tra xem ít nhất một sản phẩm đã được chọn hay chưa
        var selectedProductCount = $scope.filterProductDetails.filter(function (productDetail) {
            return productDetail.selected;
        }).length;

        if (selectedProductCount === 0) {
            $scope.errors.products = 'Vui lòng chọn ít nhất một sản phẩm.';
        }

        var hasErrors = Object.keys($scope.errors).length > 0;

        return !hasErrors;
    };


    $scope.hideError = function (value) {
        // Ẩn thông báo lỗi cho trường fieldName
        $scope.errors[value] = '';

    };

    $scope.searchData = function () {
        $scope.currentPage = 1; // Reset trang về 1 khi thực hiện tìm kiếm
        $scope.filterProductDetails = $filter('filter')($scope.productDetails, $scope.searchText);
        $scope.filterProductDiscounts = $filter('filter')($scope.productDiscounts, $scope.searchText);

    };


    $scope.toggleProductTable = function () {
        $scope.showProductTable = !$scope.showProductTable;
    };


    $scope.calculateRange = function () {
        var totalItems = $scope.filterProductDetails.length || $scope.filterProductDiscounts.length;
        var start = ($scope.currentPage - 1) * $scope.itemsPerPage;
        var end = Math.min(start + $scope.itemsPerPage, totalItems);
        return start + 1 + "-" + end + " của " + totalItems;
    };





    $scope.loadDiscounts = function () {
        var url = `${host}`;
        $http
            .get(url)
            .then((resp) => {
                $scope.productDiscounts = resp.data;
                $scope.searchData();

            })
            .catch((error) => {
                console.log("Error", error);
            });
    };



    // Lấy dữ liệu loại danh mục
    $http
        .get("/rest/productDetails")
        .then((resp) => {
            $scope.productDetails = resp.data;
            $scope.searchData();

        })
        .catch((error) => {
            console.log("Error", error);
        });

    // Gọi API để lấy dữ liệu discounts
    $http.get("/rest/discounts")
        .then(function (response) {
            // Lọc dữ liệu theo điều kiện endDate lớn hơn ngày hiện tại
            $scope.discounts = filterDiscounts(response.data);
        })
        .catch(function (error) {
            console.log("Error", error);
        });

    // Hàm để lọc dữ liệu discounts
    function filterDiscounts(discounts) {
        var currentDate = new Date();
        return discounts.filter(function (discount) {
            return new Date(discount.endDate) > currentDate;
        });
    }

    $scope.selectAllOnPage = false;

    $scope.toggleAllOnPage = function () {
        angular.forEach($scope.filterProductDetails, function (productDetail) {
            // Chỉ chọn các sản phẩm trên trang hiện tại
            if ($scope.currentPage === Math.ceil(($scope.productDetails.indexOf(productDetail) + 1) / $scope.itemsPerPage)) {
                productDetail.selected = $scope.selectAllOnPage;
            }
        });
    };

    $scope.saveDiscount = function () {

        if (!$scope.checkErrors()) {
            return;
        }

        var selectedProductDetails = $scope.productDetails.filter(function (productDetail) {
            return productDetail.selected;
        });

        var productDiscount = {
            id: $scope.editingDiscount.id,
            discount: $scope.editingDiscount.discount || null,
            productDetails: selectedProductDetails || []
        };



        var url = `${host}`;
        $http
            .post(url, productDiscount)
            .then((resp) => {
                $scope.loadDiscounts();
                $scope.resetForm();
                Swal.fire({
                    icon: "success",
                    title: "Thành công",
                    text: `Thêm giảm giá sản phẩm `,
                });
            })
            .catch((error) => {
                Swal.fire({
                    icon: "error",
                    title: "Thất bại",
                    text: `Thêm giảm giá sản phẩm thất bại`,
                });
            });
    };



    $scope.deleteDiscount = function (id) {
        Swal.fire({
            title: "Xóa Giảm Giá?",
            text: "Bạn có chắc chắn muốn xóa giảm giá sản phẩm này?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Có",
            cancelButtonText: "Không",
        }).then((result) => {
            if (result.isConfirmed) {
                var url = `${host}/${id}`;
                $http
                    .delete(url)
                    .then(function (resp) {
                        if (resp.status === 200) {
                            $scope.loadDiscounts();
                            Swal.fire({
                                icon: "success",
                                title: "Thành công",
                                text: `Xóa giảm giá sản phẩm ${id} thành công`,
                            });
                        } else {
                            Swal.fire({
                                icon: "error",
                                title: "Thất bại",
                                text: `Không thể xóa giảm giá sản phẩm ${id} vì có khóa ngoại với các dữ liệu khác.`,
                            });
                        }
                    })
                    .catch(function (error) {
                        Swal.fire({
                            icon: "error",
                            title: "Thất bại",
                            text: `Xóa giảm giá sản phẩm ${id} thất bại`,
                        });
                    });
            }
        });
    };


    $scope.resetForm = function () {
        $scope.editingDiscount = {};
        $scope.isEditing = false;
        // Làm mới tất cả các checkbox đã chọn trong filterProductDetails
        angular.forEach($scope.filterProductDetails, function (productDetail) {
            productDetail.selected = false;
        });

    };

    $scope.loadDiscounts();
});
