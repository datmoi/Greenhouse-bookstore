var app = angular.module('admin-app', ['ngRoute', 'ui.bootstrap', 'angular-jwt']);

app.config(function ($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "page/home/index.html",
            controller: "IndexController"
        })
        .when("/account-form", {
            templateUrl: "page/account-manager/form_account.html",
            controller: "AccountController"
        })
        .when("/account-table", {
            templateUrl: "page/account-manager/table_account.html",
            controller: "AccountController"
        })
        .when("/role-form", {
            templateUrl: "page/account-manager/form_role.html",
            controller: "AuthoritiesController"
        })
        .when("/author-form", {
            templateUrl: "page/author-manager/form_author.html",
            controller: "AuthorController"

        })
        .when("/author-table", {
            templateUrl: "page/author-manager/table_author.html",
            controller: "AuthorController"
        })
        .when("/brand-form", {
            templateUrl: "page/brand-manager/form_brand.html",
            controller: "brandController"
        })
        .when("/brand-table", {
            templateUrl: "page/brand-manager/table_brand.html",
            controller: "brandController"
        })
        .when("/category-form", {
            templateUrl: "page/category-manager/form_category.html",
            controller: "CategoryController"
        })
        .when("/category-table", {
            templateUrl: "page/category-manager/table_category.html",
            controller: "CategoryController"
        })
        .when("/categorytype-form", {
            templateUrl: "page/category-manager/form_categorytype.html",
            controller: "CategoryTypeController"
        })
        .when("/categorytype-table", {
            templateUrl: "page/category-manager/table_categorytype.html",
            controller: "CategoryTypeController"
        })
        .when("/discount-form", {
            templateUrl: "page/coupon-manager/form_discount.html",
            controller: "DiscountController"
        })
        .when("/discount-table", {
            templateUrl: "page/coupon-manager/table_discount.html",
            controller: "DiscountController"
        })
        .when("/voucher-form", {
            templateUrl: "page/coupon-manager/form_voucher.html",
            controller: ""
        })
        .when("/voucher-table", {
            templateUrl: "page/coupon-manager/table_voucher.html",
            controller: ""
        })
        .when("/flashsale-form", {
            templateUrl: "page/coupon-manager/form_flashsale.html",
            controller: "flashsaleController"
        })
        .when("/flashsale-table", {
            templateUrl: "page/coupon-manager/table_flashsale.html",
            controller: "flashsaleController"
        })
        .when("/inventory-form", {
            templateUrl: "page/inventory-manager/inventory_form.html",
            controller: "InventoryStatic"
        })
        .when("/inventory-table", {
            templateUrl: "page/inventory-manager/inventory_table.html",
            controller: "inventoryCtrl"
        })
        //đơn hàng
        .when("/order-manager", {
            templateUrl: "page/order-manager/table_order.html",
            controller: ""
        })
        .when("/product-table", {
            templateUrl: "page/product-manager/table_product.html",
            controller: "ProductController"
        })
        .when("/product-form", {
            templateUrl: "page/product-manager/form_product.html",
            controller: "ProductController"
        })
        .when("/product-learning-table", {
            templateUrl: "page/product-manager/form_product_learning.html",
            controller: ""
        })
        //nhà xuất bản
        .when("/publisher-form", {
            templateUrl: "page/publisher-manager/form_publishers.html",
            controller: "PublishersController"
        })
        .when("/publisher-table", {
            templateUrl: "page/publisher-manager/table_publishers.html",
            controller: "PublishersController"
        })
        //nhà cung cấp
        .when("/supplier-form", {
            templateUrl: "page/supplier-manager/form_supplier.html",
            controller: "SuppliersController"
        })
        .when("/supplier-table", {
            templateUrl: "page/supplier-manager/table_supplier.html",
            controller: "SuppliersController"
        })
        //thống kê
        .when("/inventory-statics", {
            templateUrl: "page/statistical-manager/inventory-statics.html",
            controller: "InventoryStatic"
        })
        .when("/revenue-static-overtime", {
            templateUrl: "page/statistical-manager/revenue-static-overtime.html",
            controller: "StaticOvertime"
        })
        .when("/static-best-seller", {
            templateUrl: "page/statistical-manager/static-best-seller.html",
            controller: "BestSellerController"
        })
})

app.run(['$rootScope', 'jwtHelper', function ($rootScope, jwtHelper) {
    $rootScope.page = {
        setTitle: function (title) {
            this.title = 'GreenHouse | ' + title;
        }
    };

    var token = localStorage.getItem("token");

    if (!token) {
        console.error('Token not found');
        return;
    }

    try {
        // Giải mã token và lấy thông tin từ payload
        var decodedToken = jwtHelper.decodeToken(token);
        // Lấy danh sách vai trò từ decoded token
        var roles = decodedToken.roles;
        if (roles && Array.isArray(roles)) {
            var isAdmin = roles.some(role => role.authority === 'ROLE_ADMIN');
            $rootScope.roleName = isAdmin ? "Quản lý" : "Nhân viên";
        }
    } catch (error) {
        console.error('Error decoding token:', error.message);
    }
}]);

// Tạo một interceptor
app.factory('tokenInterceptor', ['$window', function ($window) {
    return {
        request: function (config) {
            var token = $window.localStorage.getItem('token');
            if (token) {
                config.headers['Authorization'] = 'Bearer ' + token;
            }
            return config;
        },
        responseError: function (response) {
            // Kiểm tra nếu mã trạng thái là 401 Unauthorized (token hết hạn)
            if (response.status === 401) {
                // Token đã hết hạn, xoá nó khỏi local storage
                localStorage.removeItem("token");
                localStorage.removeItem("fullName");
                localStorage.removeItem("username");
                localStorage.removeItem("image");
                // Chuyển hướng đến trang /login
                window.location.href = "/logout";
            }
            return response;
        }
    };
}]);

// Đăng ký interceptor vào ứng dụng
app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('tokenInterceptor');
}]);

app.filter('startFrom', function () {
    return function (input, start) {
        if (!input || !Array.isArray(input)) {
            return [];
        }

        start = +start; // Chuyển đổi start thành số nguyên
        return input.slice(start); // Trả về mảng con bắt đầu từ start
    };
});


