app.controller('indexClientController', indexClientController);

function indexClientController($scope, $http) {
    let host = "http://localhost:8081/customer/rest";

    // Khai báo một mảng để lưu trữ dữ liệu từ API
    $scope.listProductSelling = [];
    $scope.sellingProducts = [];
    $scope.selectedBrandProducts = [];
    $scope.listProductDiscount = [];
    $scope.listProductReviews = [];
    $scope.listInvoiceDetails = [];
    $scope.listProductDetails = [];
    $scope.selectedBrand = null; // Thêm biến để theo dõi brand đang được chọn
    $scope.numStar = [1, 2, 3, 4, 5];
    $scope.visibleProductDiscountTodayCount = 8;
    $scope.visibleProductByBrandCount = 8;
    $scope.visibleSellingProductsCount = 8;
    $scope.quickViewProduct = null;
    $scope.parentCategoriesTypes = [];
    $scope.listCategories = [];
    $scope.listCategoryTypes = [];
    $scope.listProductDiscountToday = [];
    // Hàm để load dữ liệu ban đầu và hiển thị sản phẩm thương hiệu đầu tiên
    $scope.redirectToProduct = function (categoryId, categoryName) {
        // Chuyển cả categoryId và categoryName đến trang product
        localStorage.setItem("categoryId", categoryId);
        localStorage.setItem("categoryName", categoryName);
        window.location.href = '/product';
    };
   

    $scope.loadIndex = function () {
        var url = `${host}/getDataIndex`;
        $scope.showLoading();
        $http.get(url)
            .then(function (response) {
                $scope.sellingBrands = response.data.sellingBrands;
                $scope.sellingProducts = response.data.sellingProducts.filter(function (productDetail) {
                    return productDetail.product.status === true;
                });
                $scope.listProductDiscount = response.data.listProductDiscount;
                $scope.listProductReviews = response.data.listProductReviews;
                $scope.listBookAuthor = response.data.listBookAuthor;
                $scope.listInvoiceDetails = response.data.listInvoiceDetails;
                $scope.listProductSelling = response.data.listProductSelling;
                $scope.selectedBrandId = $scope.sellingBrands[0].brandId;
                $scope.selectBrand($scope.selectedBrandId);
                $scope.listProductDetails = response.data.listProduct_Details;
                $scope.listProductDiscountToday = response.data.listProductDiscountToday
                    .filter(function (productDetail) {
                        return productDetail.product.status === true;
                    });
                $scope.parentCategoriesTypes = response.data.parentCategoriesTypes;
                $scope.listCategories = response.data.listCategories;
                $scope.listCategoryTypes = response.data.listCategoryTypes;
                $scope.getSubcategories = function (parentCategory, typeName) {
                    return $scope.listCategories.filter(function (category) {
                        return category.typeId.parentCategoriesType === parentCategory && category.typeId.typeName === typeName;
                    });
                };
            })
            .catch(function (error) {
                console.error('Error fetching data: ' + error);
            }).finally(() => {
            $scope.hideLoading();
        });
    }
    // Hàm để lấy sản phẩm chi tiết theo brandId
    $scope.loadSelectedBrandProducts = function (brandId) {
        var url = `${host}/getProductsByBrand/${brandId}`; // Điều này phụ thuộc vào API của bạn
        $http.get(url)
            .then(function (response) {
                // Xử lý dữ liệu nhận được từ máy chủ
                $scope.selectedBrandProducts = response.data.filter(function (productDetail) {
                    return productDetail.product.status === true;
                });
            })
            .catch(function (error) {
                console.error('Error fetching data: ' + error);
            });
    }

    // Lắng nghe sự kiện khi người dùng chọn một thương hiệu cụ thể
    $scope.selectBrand = function (brandId) {
        $scope.selectedBrand = brandId;
        $scope.loadSelectedBrandProducts(brandId);

        // Loops through sellingBrands to set the active brand
        for (var i = 0; i < $scope.sellingBrands.length; i++) {
            if ($scope.sellingBrands[i].brandId === brandId) {
                $scope.sellingBrands[i].active = true;
            } else {
                $scope.sellingBrands[i].active = false;
            }
        }
    }

    $scope.getDiscountValueByProductId = function (id) {
        var discountValue = null;
        $scope.listProductDiscount.find(e => {
            if (e.productDetail.productDetailId === id) {
                discountValue = e.discount.value
            }
        });
        return discountValue ? discountValue : 0;
    }
    $scope.getStarRatingByProductId = function (productDetailId) {
        var totalStars = 0;
        var totalReviews = 0;

        $scope.listProductReviews.forEach(review => {
            if (review.productDetail.productDetailId === productDetailId) {
                totalStars += review.star;
                totalReviews++;
            }
        });

        if (totalReviews > 0) {
            var averageRating = totalStars / totalReviews;
            return Math.round(averageRating);
        } else {
            return 0;
        }
    }


    $scope.quickView = function (productDetail) {
        // xem nhanh thông tin sản phẩm
        $scope.quickViewProduct = productDetail;

        $scope.quickViewProduct.quantity = 1;
    }
    // Xem thêm
    $scope.loadMoreProductDiscountToday = function () {
        $scope.visibleProductDiscountTodayCount += 8;
    };
    $scope.loadMoreSellingProducts = function () {
        $scope.visibleSellingProductsCount += 8;
    };
    $scope.loadMoreProductByBrand = function () {
        $scope.visibleProductByBrandCount += 8;
    };

    // Gọi hàm loadIndex để lấy dữ liệu ban đầu
    $scope.loadIndex();
}