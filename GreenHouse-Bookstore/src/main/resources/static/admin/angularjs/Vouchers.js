app.controller("VouchersController", function ($scope, $location, $routeParams, $http) {
        let host = "http://localhost:8081/rest/vouchers";

        $scope.searchText = "";
        $scope.itemsPerPageOptions = [5, 12, 24, 32, 64, 128];
        $scope.selectedItemsPerPage = 5; // Khởi tạo giá trị mặc định cho số mục trên mỗi trang
        $scope.currentPage = 1; // Trang hiện tại
        $scope.itemsPerPage = 5; // Số mục hiển thị trên mỗi trang
        $scope.vouchers = [];
        $scope.totalItems = $scope.vouchers.length; // Tổng số mục
        $scope.maxSize = 5; // Số lượng nút phân trang tối đa hiển thị
       

        $scope.edittingVoucher = {};
        $scope.isEditing = false;

        $scope.selectedType = "";
        $scope.isSelectingProduct = true;
        $scope.modalTitle = "Chọn loại sản phẩm";

        $scope.searchKeyword = "";

        $scope.searchCategoryResults = [];
        $scope.selectedCategories = [];
        $scope.searchCategoryKeyword = null;
        $scope.listCategories = [];
        $scope.listdeletedCategories = [];

        $scope.filteredProducts = [];

        $scope.listProductDetails = [];
        $scope.searchProductResults = [];
        $scope.selectedProductDetails = [];
        $scope.searchProductKeyword = null;
        $scope.listdeletedProducts = [];

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

        $scope.searchData = function () {
            // Lọc danh sách gốc bằng searchText
            $scope.vouchers = $scope.originalvoucher.filter(function (vouchers) {
                // Thực hiện tìm kiếm trong các thuộc tính cần thiết của item
                if (vouchers.voucherName) {
                    return (
                        vouchers.voucherName.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                        vouchers.code.toString().includes($scope.searchText) ||
                        vouchers.voucherType.toLowerCase().includes($scope.searchText.toLowerCase()) ||
                        vouchers.discountType.toLowerCase().includes($scope.searchText.toLowerCase())
                    );
                }
                return false; // Bỏ qua mục này nếu fullname là null hoặc undefined
            });
            $scope.totalItems = $scope.searchText ? $scope.vouchers.length : $scope.originalvoucher.length;
            $scope.setPage(1);
        };

        //Get Voucher
        $scope.loadVouchers = function () {
            var url = `${host}`;
            $http
                .get(url)
                .then((resp) => {
                    $scope.vouchers = resp.data;
                    $scope.originalvoucher = $scope.vouchers;
                    $scope.totalItems = $scope.vouchers.length;
                })
                .catch((error) => {
                    console.log("Error", error);
                });
        };


        //Get bảng Category
        $scope.loadCategory = function () {
            var url = "http://localhost:8081/rest/categories";
            $http
                .get(url)
                .then((resp) => {
                    $scope.listCategories = resp.data;
                })
                .catch((error) => {
                    console.log("Error", error); 
                });
        };

        // SEARCH Category -- START
        $scope.searchCategory = function (keyword) {
            $scope.searchCategoryResults = [];
            if (keyword) {
                keyword = keyword.toLowerCase();
                $scope.searchCategoryResults = $scope.listCategories.filter(function (
                    cate
                ) {
                    return cate.categoryName.toLowerCase().includes(keyword);
                });
            } else {
                $scope.searchCategoryKeyword = null;
            }
        };

        $scope.loadCategory();

        //Select Category để hiển thị khi search trên modal
        $scope.selectedCategory = function (cate) {
            var existingCategory = $scope.selectedCategories.find(function (c) {
                return c.categoryId === cate.categoryId;
            });

            if (!existingCategory) {
                $scope.selectedCategories.push(cate);
            }

            // Gọi hàm tương ứng để cập nhật giao diện người dùng (nếu cần)
            $scope.searchCategory(null);
        };
        //Hàm Xóa Product Tạm
        $scope.removeCategory = function (index) {
            var removedCategory = $scope.selectedCategories[index];

            if (removedCategory) {
                removedCategory.deleted = true; // Đánh dấu danh mục đã bị xóa
                $scope.listdeletedCategories.push(removedCategory);
                $scope.selectedCategories.splice(index, 1); // Loại bỏ danh mục khỏi selectedCategories
                console.log("Đã xóa được", removedCategory);
            }
        };

        //-------------------------------------------------------------------------------
        //Get bảng Product
        $scope.loadProduct = function () {
            var url = "http://localhost:8081/rest/productDetails";
            $http
                .get(url)
                .then((resp) => {
                    $scope.listProductDetails = resp.data;
                    console.log($scope.listProductDetails);
                })
                .catch((error) => {
                    console.log("Error", error);
                });
        };

        // SEARCH Product -- START
        $scope.searchProduct = function (keyword) {
            $scope.searchProductResults = [];
            if (keyword) {
                keyword = keyword.toLowerCase();
                $scope.searchProductResults = $scope.listProductDetails.filter(
                    function (pro) {
                        return pro.product.productName.toLowerCase().includes(keyword);
                    }
                );
            } else {
                $scope.searchProductKeyword = null;
            }
        };
        $scope.loadProduct();

        //Select Product để hiển thị khi search trên modal
        $scope.selectedProductDetail = function (pro) {
            var existingProduct = $scope.selectedProductDetails.find(function (p) {
                return p.productDetailId === pro.productDetailId;
            });

            if (!existingProduct) {
                $scope.selectedProductDetails.push(pro);
            }
            // Gọi hàm tương ứng để cập nhật giao diện người dùng (nếu cần)
            $scope.searchProduct(null);
        };

        //Hàm Xóa Product Tạm
        $scope.removeProducts = function (index) {
            var removeProducts = $scope.selectedProductDetails[index];

            if (removeProducts) {
                removeProducts.deleted = true; // Đánh dấu danh mục đã bị xóa
                $scope.listdeletedCategories.push(removeProducts);
                $scope.selectedProductDetails.splice(index, 1); // Loại bỏ danh mục khỏi selectedProduct
                console.log("Đã xóa được", removeProducts);
            }
        };



        $scope.validateVoucher = function (voucher) {
            var isError = false;

            var errorMessages = {
                voucherName: "",
                code: "",
                voucherType: "",
                discountType: "",
                discountAmount: "",
                discountPercentage: "",
                minimumPurchaseAmount: "",
                maximumDiscountAmount: "",
                startDate: "",
                endDate: "",
                totalQuantity: "",
            };

            if (!voucher.voucherName) {
                errorMessages.voucherName = "Vui lòng không bỏ trống tên voucher";
                isError = true;
            }

            if (!voucher.code) {
                errorMessages.code = "Vui lòng không bỏ trống mã voucher";
                isError = true;
            }

            if (!voucher.voucherType) {
                errorMessages.voucherType = "Vui lòng không bỏ trống loại khuyến mãi";
                isError = true;
            }

            if (!voucher.discountType) {
                errorMessages.discountType =
                    "Vui lòng không bỏ trống hình thức khuyến mãi";
                isError = true;
            }

            if (!$scope.discountTypeSelected) {
                var typeVoucher = $scope.edittingVoucher.discountType;
                if (typeVoucher === "Giảm giá cố định") {
                    if (!voucher.discountAmount) {
                        errorMessages.discountAmount = "Vui lòng không bỏ trống số tiền";
                        isError = true;
                    }
                    if (voucher.discountAmount && voucher.discountAmount < 0) {
                        errorMessages.discountAmount = "Số tiền không thể là số âm";
                        isError = true;
                    }
                } else if (typeVoucher === "Phần trăm") {
                    if (
                        voucher.discountPercentage < 1 ||
                        voucher.discountPercentage > 100
                    ) {
                        errorMessages.discountPercentage =
                            "Phần trăm phải nằm trong khoảng từ 1 đến 100";
                        isError = true;
                    }
                    if (!voucher.discountPercentage) {
                        errorMessages.discountAmount = "Vui lòng không bỏ trống số tiền";
                        isError = true;
                    }
                }
            }

            if (!voucher.minimumPurchaseAmount) {
                errorMessages.minimumPurchaseAmount = "Vui lòng không bỏ trống số tiền";
                isError = true;
            } else if (voucher.minimumPurchaseAmount < 0) {
                errorMessages.minimumPurchaseAmount = "Số tiền không thể là số âm";
                isError = true;
            }

            if (!voucher.maximumDiscountAmount) {
                errorMessages.maximumDiscountAmount = "Vui lòng không bỏ trống số tiền";
                isError = true;
            } else if (voucher.maximumDiscountAmount < 0) {
                errorMessages.maximumDiscountAmount = "Số tiền không thể là số âm";
                isError = true;
            }

            if (!voucher.startDate) {
                errorMessages.startDate = "Vui lòng không bỏ trống ngày";
                isError = true;
            }

            if (!voucher.endDate) {
                errorMessages.endDate = "Vui lòng không bỏ trống ngày";
                isError = true;
            }

            if (!voucher.totalQuantity || voucher.totalQuantity <= 0) {
                errorMessages.totalQuantity = "Vui lòng nhập số lượng hợp lệ";
                isError = true;
            }

            var start = new Date(voucher.startDate);
            var end = new Date(voucher.endDate);

            if (end <= start) {
                errorMessages.endDate = "Ngày kết thúc phải lớn hơn ngày bắt đầu";
                isError = true;
            }

            var result = {
                isError: isError,
                errorMessages: errorMessages,
            };

            return result;
        };

        //Save and Update Voucher
        $scope.saveVoucher = function () {
            var result = $scope.validateVoucher($scope.edittingVoucher);
            console.log(result);
            if (result.isError) {
                $scope.errorMessages = result.errorMessages;
            } else {
                var data = {
                    voucher: {
                        voucherId: $scope.edittingVoucher.voucherId,
                        voucherName: $scope.edittingVoucher.voucherName,
                        code: $scope.edittingVoucher.code,
                        voucherType: $scope.edittingVoucher.voucherType,
                        discountType: $scope.edittingVoucher.discountType,
                        discountAmount: $scope.edittingVoucher.discountAmount,
                        discountPercentage: $scope.edittingVoucher.discountPercentage,
                        minimumPurchaseAmount: $scope.edittingVoucher.minimumPurchaseAmount,
                        maximumDiscountAmount: $scope.edittingVoucher.maximumDiscountAmount,
                        startDate: $scope.edittingVoucher.startDate,
                        endDate: $scope.edittingVoucher.endDate,
                        totalQuantity: $scope.edittingVoucher.totalQuantity,
                        usedQuantity: $scope.edittingVoucher.usedQuantity,
                        status: $scope.edittingVoucher.status == true,
                        description: $scope.edittingVoucher.description,
                    },
                    categories: $scope.selectedCategories,
                    productDetails: $scope.selectedProductDetails,
                    listdeletedCategories: $scope.listdeletedCategories,
                    listdeletedProducts: $scope.listdeletedProducts,
                };

                $http
                    .post(host, data)
                    .then((resp) => {
                        console.log("Thêm Voucher thành công", data);
                        $scope.loadVouchers();
                        $scope.resetForm();
                        showSuccess(resp.data.message);
                    })
                    .catch(function (error) {
                        console.log(error);
                        var action = $scope.isEditing ? "Thêm" : "Cập nhật";
                        showError(`${action} voucher thất bại`);
                    });
            }
        };

        $scope.checkDuplicateCode = function (code) {
            // Kiểm tra trùng lặp code
            var existingCode = $scope.accounts.find(function (voucher) {
                return voucher.code === code;
            });

            if (existingCode) {
                $scope.errorMessages.code = "Mã code đã tồn tại.";
                return true; // Đã tồn tại
            }

            return false; // Chưa tồn tại
        };

        //Edit Voucher và chuyển hướng
        $scope.editVoucherAndRedirect = function (voucherId) {
            var url = `${host}/${voucherId}`;
            $http
                .get(url)
                .then(function (resp) {
                    $location.path("/voucher-form").search({
                        id: voucherId,
                        data: angular.toJson(resp.data), // Chuyển đổi thành JSON
                    });
                })
                .catch(function (error) {
                    console.log("Error", error);
                });
        };

        // Kiểm tra xem có tham số data trong URL không.
        if ($routeParams.data) {
            // Parse dữ liệu từ tham số data và gán vào edittingVoucher.
            var data = angular.fromJson($routeParams.data);
            $scope.edittingVoucher = data.vouchers;
            $scope.selectedCategories = data.categories;
            $scope.selectedProductDetails = data.productDetails;
            console.log(data);
            $scope.isEditing = true;
        }

        //Chuyển đổi 3 button khi click radio
        $scope.$watch("edittingVoucher.voucherType", function (newVal, oldVal) {
            if (newVal === "Loại sản phẩm") {
                $scope.selectedType = "product";
            } else if (newVal === "Sản phẩm") {
                $scope.selectedType = "item";
            } else if (newVal === "Phí ship") {
                $scope.selectedType = "ship";
            } else if (newVal === "Hóa đơn") {
                $scope.selectedType = "bill";
            } else {
                $scope.selectedType = "";
            }
        });

        //thay đổi khi chọn sản phẩm và chọn loại sản phẩm khi vào nút
        $scope.toggleSelection = function () {
            $scope.isSelectingProduct = !$scope.isSelectingProduct;
            $scope.modalTitle = $scope.isSelectingProduct ?
                "Chọn sản phẩm" :
                "Chọn loại sản phẩm";
        };


        //Chuyển đổi input Phần trăm và Giảm giá cố định khi click radio
        $scope.toggleDiscountType = function () {
            if ($scope.edittingVoucher.discountType === "Phần trăm") {
                $scope.edittingVoucher.discountAmount = null; // Reset giá trị số tiền giảm
            } else if ($scope.edittingVoucher.discountType === "Giảm giá cố định") {
                $scope.edittingVoucher.discountPercentage = null; // Reset giá trị phần trăm giảm
            }
        };

        //Search Modal
        $scope.search = function () {
            $http
                .get("http://your-api-url.com/products?search=" + $scope.searchKeyword)
                .then(function (response) {
                    $scope.filteredProducts = response.data;
                })
                .catch(function (error) {
                    console.error("Error fetching product information:", error);
                });
        };

        $scope.selectProduct = function (product) {
            $scope.selectedProduct = product;
        };

        //DELETE VOUCHER
        $scope.deleteVoucher = function (voucherId) {
            var url = `${host}/${voucherId}`;
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
                    $http
                        .delete(url)
                        .then((resp) => {
                            // Xóa voucher thành công, cập nhật danh sách
                            $scope.loadVouchers();
                            Swal.fire({
                                icon: "success",
                                title: "Thành công",
                                text: `Xóa Voucher ${voucherId} thành công`,
                            });
                        })
                        .catch((error) => {
                            if (error.status === 409) {
                                // Kiểm tra mã trạng thái lỗi
                                Swal.fire({
                                    icon: "error",
                                    title: "Thất bại",
                                    text: `Voucher mã ${voucherId} đang được sử dụng và không thể xóa.`,
                                });
                            } else {
                                Swal.fire({
                                    icon: "error",
                                    title: "Thất bại",
                                    text: `Xóa Voucher ${voucherId} thất bại`,
                                });
                            }
                        });
                }
            });
        };

        //RESET FORM VOUCHER
        $scope.resetForm = function () {
            // Kiểm tra xem có tham số "id" và "data" trong URL không, và nếu có thì xóa chúng
            if ($location.search().id || $location.search().data) {
                $location.search("id", null);
                $location.search("data", null);
            }
            // Gán giá trị cho editingBrand và isEditing
            $scope.selectedCategories = [];
            $scope.selectedProduct = [];
            $scope.edittingVoucher = {};
            $scope.isEditing = false;
            $scope.errorMessages = [];

            // Chuyển hướng lại đến trang /brand-form
            $location.path("/voucher-form");
        };

        //FORMAT DATE
        $scope.formatDate = function (date) {
            if (date == null) {
                return "";
            }
            var formattedDate = new Date(date);
            var year = formattedDate.getFullYear();
            var month = (formattedDate.getMonth() + 1).toString().padStart(2, "0");
            var day = formattedDate.getDate().toString().padStart(2, "0");

            return `${year}-${month}-${day}`;
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


        $scope.loadVouchers();
    }
);

//Thông báo Success
function showSuccess(message) {
    Swal.fire({
        icon: "success",
        title: "Thành công",
        text: message,
    });
}

//Thông báo Error
function showError(message) {
    Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: message,
    });
}