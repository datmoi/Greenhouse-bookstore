const app = angular.module("myApp", ["angular-jwt", "ngCookies", "ngRoute", "angularUtils.directives.dirPagination"]);
app.constant('signupAPI', 'http://localhost:8081/sign-up');
app.constant('checkOutAPI', 'http://localhost:8081/customer/rest/check-out');
app.constant('productPageAPI', 'http://localhost:8081/customer/rest/product-page');
app.constant('cartAPI', 'http://localhost:8081/customer/rest/cart');
app.constant('checkoutAPI', 'http://localhost:8081/customer/rest/checkout')
app.constant('changePasswordAPI', 'http://localhost:8081/customer/rest/reset-password');
app.constant('forgotPasswordAPI', 'http://localhost:8081/customer/rest/forgot-password');
app.constant('productDetailAPI', 'http://localhost:8081/customer/rest/product-detail');
app.constant('voucherAPI', 'http://localhost:8081/customer/rest/voucher');
app.constant('customerAPI', "http://localhost:8081/customer/rest");
app.constant('orderHistoryAPI', 'http://localhost:8081/customer/rest/order-history');
app.constant('contactAPI', 'http://localhost:8081/send/send-contact');

app.run(function ($rootScope, $http, $templateCache, jwtHelper) {

    var jsFiles = [
        "js/custom.js",
        "js/code.js",
        "js/login-register.js",
        "js/plugins.js"
    ]; // Danh sách các tệp JavaScript

    function loadAndAppendScript(jsFile) {
        return $http.get(jsFile).then(function (response) {
            $templateCache.put(jsFile, response.data);
            var scriptElement = document.createElement("script");
            scriptElement.innerHTML = $templateCache.get(jsFile);
            document.body.appendChild(scriptElement);
            return Promise.resolve();
        });
    }

    $rootScope.$on("$viewContentLoaded", function () {
        Promise.all(jsFiles.map(loadAndAppendScript));
    });

    function checkTokenExpiration() {
        var token = localStorage.getItem("token");

        if (token) {
            if (jwtHelper.isTokenExpired(token)) {
                // Token đã hết hạn, xoá nó khỏi local storage
                localStorage.removeItem("token");
                localStorage.removeItem("fullName");
                localStorage.removeItem("username");
                localStorage.removeItem("image");
                window.location.href = "/logout";
            }
        }
    }

    // Gọi hàm kiểm tra khi trang được tải lại và sau mỗi khoảng thời gian (ví dụ: mỗi 30 phút)
    window.onload = function () {
        checkTokenExpiration();
        setInterval(checkTokenExpiration, 1000); // 1s
    };
});

// Tạo một interceptor
app.factory("tokenInterceptor", function () {
    return {
        request: function (config) {
            var token = window.localStorage.getItem("token");
            // Kiểm tra nếu token tồn tại
            if (token) {
                config.headers["Authorization"] = "Bearer " + token;
            }
            return config;
        },
        responseError: function (response) {
            // Kiểm tra nếu mã trạng thái là 401 Unauthorized (token hết hạn)
            if (response.status === 401) {
                $window.localStorage.removeItem("token");
                $window.localStorage.removeItem("username");
                $window.localStorage.removeItem("fullName");
                $window.localStorage.removeItem("image");
                window.location.href = "/logout";
            }
            return response;
        },
    };
});

app.factory("AuthService", function ($window) {
    var service = {};

    service.logout = function () {
        $window.localStorage.removeItem("token");
        $window.localStorage.removeItem("username");
        $window.localStorage.removeItem("fullName");
        $window.localStorage.removeItem("image");
        window.location.href = "/logout";
    };

    return service;
});

// Đăng ký interceptor vào ứng dụng
app.config(["$httpProvider", function ($httpProvider) {
    $httpProvider.interceptors.push("tokenInterceptor");
},]);

// ================= MAIN CONTROLLER ==================
app.controller("MainController", function ($scope, CartService, $timeout, jwtHelper, ProductDetailService, NotifyService, SearchDataService, WebSocketService) {
        var token = localStorage.getItem("token");
        var username;
        if (token) {
            var decodedToken = jwtHelper.decodeToken(token);
            username = decodedToken.sub;
        }
        $scope.token = token;
        $scope.username = username;
        $scope.currentPage = 1;
        //======================   SEARCH ===============================//
        $scope.listSearchHistories = [];
        $scope.listSearchInvoices = [];
        $scope.listProductDetails = [];
        $scope.listProductDetailsResult = [];
        $scope.listCategories = [];
        $scope.keyword = null;

    // Lấy lịch sử tìm kiếm từ localStorage khi controller khởi tạo
    $scope.updateSearchHistory = function () {
        // Nếu không có token hoặc username, cập nhật từ LocalStorage
        var searchHistory = SearchDataService.getSearchHistory();

        // Sắp xếp theo thời gian giảm dần
        searchHistory.sort(function (a, b) {
            return new Date(b.searchTime) - new Date(a.searchTime);
        });

        // Lấy 16 dòng đầu tiên
        $scope.searchHistory = searchHistory.slice(0, 16);

    };

    $scope.updateSearchHistory();


    $scope.search = function (keyword) {
        $scope.searchProductResults = [];
        // $scope.keyword = keyword;
        if (keyword) {
            keyword = keyword.toLowerCase();
            $scope.listProductDetailsResult.forEach(function (productD) {
                if (productD.product.productName.toLowerCase().includes(keyword)) {
                    $scope.searchProductResults.push(productD);
                }
            });
        } else {
            $scope.keyword = null;
        }
        // Sau khi tìm kiếm, thêm từ khóa vào lịch sử
        // SearchDataService.addToSearchHistory(keyword);
        // Cập nhật lại danh sách lịch sử tìm kiếm
        console.log($scope.keyword);
        $scope.updateSearchHistory();
    };

    $scope.searchData = function (keyword) {
        SearchDataService.addToSearchHistory(keyword);
        localStorage.setItem('keyword', keyword);
        console.log($scope.keyword);
        $scope.updateSearchHistory();
        window.location.href = '/product';
    }
    $scope.getSearchProductDetail = function (productDetailId) {
        ProductDetailService.getProductDetailById(productDetailId)
            .then(function (response) {
                // Thực hiện các hành động cần thiết sau khi lấy dữ liệu sản phẩm
                localStorage.setItem('keyword', '');
                $scope.keyword = localStorage.getItem('keyword');
                // Set lại giá trị của input thành rỗng
                // (đảm bảo rằng có một ng-model trong HTML liên kết với input)
                window.location.href = '/product-details?id=' + productDetailId;
            })
            .catch(function (error) {
                console.log('Lỗi khi lấy dữ liệu sản phẩm: ' + error);
            });
    };

    // Hàm Xóa
    $scope.removeSearchHistory = function (index) {
        SearchDataService.removeFromSearchHistory(index);
        $scope.updateSearchHistory();
    };

    // Hàm Xóa Tất Cả
    $scope.clearSearchHistory = function () {
        SearchDataService.clearSearchHistory();
        $scope.updateSearchHistory();
    };

    $scope.getSearch = function () {
        SearchDataService.getSearchData()
            .then(function (response) {
                $scope.listSearchInvoices = response.listSearch_Invoice;
                $scope.listProductDetails = response.listProduct_Details;
                $scope.loadModelProduct();
            })
            .catch(function (error) {
                console.error('Error fetching search data:', error);
            });
        $scope.keyword = localStorage.getItem('keyword') || null;
    };
    $scope.loadModelProduct = function () {
        $scope.listProductDetailsResult = [];
        $scope.listProductDetails.filter(function (item) {
            if (item.product.status === true) {
                $scope.listProductDetailsResult.push(item);
            }
        });
        console.log("Danh sách sản phẩm có status = 1:", $scope.listProductDetailsResult);

    }
        $scope.getSearch();
        //======================  NOTIFICATION HEADER  =====================//

        $scope.isWebSocketConnected = false;

        $scope.connectWebSocket = function () {
            WebSocketService.connect(function () {
                $scope.isWebSocketConnected = true;
                // Đăng ký cho đường dẫn /user/{username}/topic/notification (ví dụ)
                WebSocketService.subscribeToTopic('/user/' + $scope.username + '/topic/notification', function (notification) {
                    console.log("Received Notification:", notification);
                    var receivedNotification = JSON.parse(notification.body);

                    // Xử lý thông báo khi nhận được
                    if (receivedNotification.username.username === $scope.username) {
                        $scope.$apply(function () {
                            $scope.notifications.push(receivedNotification);
                            $scope.getUnreadNotifications();
                            $scope.getListNotification();
                        });
                    }
                });
            });
        };

        // Gọi hàm connectWebSocket để kết nối WebSocket khi controller được khởi tạo
        $scope.connectWebSocket();

        $scope.ListNotifyUser = [];
        $scope.ListUnNotifyUser = [];
        $scope.getUnreadNotifications = function () {
            // Sử dụng dịch vụ NotifyService để lấy danh sách thông báo có status == 0
            NotifyService.getNotificationsByUsername(username)
                .then(function (ListUnNotifyUser) {
                    // Lấy ngày hiện tại
                    var currentDate = new Date();
                    // Lọc thông báo trong khoảng 7 ngày gần nhất và status == 0
                $scope.ListUnNotifyUser = ListUnNotifyUser.filter(function (notification) {
                    var createAt = new Date(notification.createAt);
                    var timeDiff = currentDate - createAt;
                    var daysDiff = timeDiff / (1000 * 3600 * 24);
                    return daysDiff <= 7 && notification.status === false;
                });

                $scope.ListUnNotifyUser.sort(function (a, b) {
                    return new Date(b.createAt) - new Date(a.createAt);
                });
            })
            .catch(function (error) {
                console.log("Error loading unread notifications:", error);
            });
    }
    $scope.getListNotification = function () {
        // Sử dụng dịch vụ NotifyService để lấy danh sách thông báo
        NotifyService.getNotificationsByUsername(username)
            .then(function (ListNotifyUser) {
                // Lấy ngày hiện tại
                var currentDate = new Date();

                // Sắp xếp thông báo theo ưu tiên: status (false trước), ngày (thứ nhất và thứ hai)
                $scope.ListNotifyUser = ListNotifyUser
                    .sort(function (a, b) {
                        // Ưu tiên theo status
                        if (a.status !== b.status) {
                            return a.status ? 1 : -1; // false trước
                        }

                        // Ưu tiên theo ngày
                        var createAtDiff = new Date(b.createAt) - new Date(a.createAt);
                        if (createAtDiff !== 0) {
                            return createAtDiff;
                        }

                        return 0; // Nếu status và ngày giống nhau, giữ nguyên vị trí
                    });

            })
            .catch(function (error) {
                console.log("Error loading notifications:", error);
            });
    }

    $scope.markNotificationAsRead = function (notification) {
        // Kiểm tra nếu thông báo chưa được đánh dấu là đã đọc
        if (!notification.status) {
            // Gọi API để đánh dấu thông báo là đã đọc
            NotifyService.markNotificationAsRead(notification.notificationId)
                .then(function (response) {

                    console.log('Notification marked as read.');
                    // Cập nhật trạng thái của thông báo và màu sắc
                    notification.status = true;
                    // Đổi màu sắc thông báo
                    notification.customClass = 'custom-green-bg';
                    $scope.getListNotification();
                    $scope.getUnreadNotifications();
                })
                .catch(function (error) {
                    console.error('Error marking notification as read:', error);
                });
        }
    }

    $scope.getListNotification();
    $scope.getUnreadNotifications();


    $scope.addToCart = function (productDetailId, quantity) {
        CartService.addToCart(productDetailId, quantity, username)
            .then(function (response) {
                $scope.showNotifi(response.message, response.status);
                $scope.getCartHeader();
            })
            .catch(function (error) {
                console.log(
                    "error",
                    "Lỗi trong quá trình gửi dữ liệu lên server: " + error
                );
            });
    };

    $scope.buyNow = function (productDetailId, quantity) {
        CartService.buyNow(productDetailId, quantity, username)
            .then(function (response) {
                console.log(response);
                $scope.showNotifi(response.message, response.status);
                $scope.getCartHeader();
                if (response.status == 'success') {
                    window.location.href = '/cart'
                }
            })
            .catch(function (error) {
                console.log(
                    "error",
                    "Lỗi trong quá trình gửi dữ liệu lên server: " + error
                );
            });
    }

    $scope.getCartHeader = function () {
        CartService.getCart(username)
            .then(function (response) {
                $scope.listCartHeader = response.listCart;
            })
            .catch(function (error) {
                console.log(
                    "error",
                    "Lỗi trong quá trình gửi dữ liệu lên server: " + error
                );
            });
    };
    $scope.getCartHeader();
    // ================ LANGUAGE =================================================================
    $scope.toggleLanguage = function () {
        let languageDropdown = document.getElementById("top-language-dropdown");

        if (languageDropdown.style.display === "block") {
            languageDropdown.style.display = "none";
        } else {
            languageDropdown.style.display = "block";
        }
    }

    $scope.changeLanguage = function (lang) {
        localStorage.setItem("lang", lang);
        setLanguage();
    }

    function setLanguage() {
        var lang = localStorage.getItem("lang");

        let flagIcon = document.querySelector(".top-language-flag-icon");
        let languageDropdown = document.getElementById("top-language-dropdown");
        languageDropdown.style.display = "none";

        let flagImage = "";
        if (lang) {
            if (lang == "en") {
                flagImage = "https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/store/english.svg"
            } else if (lang == "vi") {
                flagImage = "https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/default.svg";
            }
        } else {
            flagImage = "https://cdn0.fahasa.com/skin/frontend/ma_vanese/fahasa/images/default.svg";
        }
        flagIcon.style.backgroundImage = `url(${flagImage})`;
    }

    setLanguage();
    // ================ SHOW FULL TEXT OR COMPRESS =================================================================
    $scope.showFullText = {};

    $scope.toggleFullText = function (productId) {
        if (!$scope.showFullText[productId]) {
            $scope.showFullText[productId] = true;
        } else {
            $scope.showFullText[productId] = false;
        }
    };

    // =========== NOTIFICATION =============================
    $scope.notifications = [];

    $scope.showNotifi = function (message, status) {
        $scope.modalContent = message;
        if (status == 'success') {
            $scope.typeNotifi = true;
        } else {
            $scope.typeNotifi = false;
        }
        $('#message-cart').modal('show');

        $timeout(function () {
            $('#message-cart').modal('hide');
        }, 2000);
    }

    // =========== LOADER =============================
    $scope.isLoading = false;
    // Hàm để hiển thị loading
    $scope.showLoading = function () {
        $scope.isLoading = true;
    };

    // Hàm để ẩn loading
    $scope.hideLoading = function () {
        $scope.isLoading = false;
    };
    //=============PRODUCT DETAIL========================
    $scope.getProductDetail = function (productDetailId) {
        ProductDetailService.getProductDetailById(productDetailId)
            .then(function (response) {
                window.location.href = '/product-details?id=' + productDetailId;
            })
            .catch(function (error) {
                console.log('Lỗi khi lấy dữ liệu sản phẩm: ' + error);
            });
    };

}
);
//================================================================================================================================
// ====================================== SERVICE ======================================
// =============== CART SERVICE =============
app.service("CartService", function ($http, cartAPI) {
    this.addToCart = function (productDetailId, quantity, username) {
        if (username) {
            var url = cartAPI + "/add";

            var data = {
                productDetailId: productDetailId,
                quantity: quantity,
                username: username,
            };

            return $http
                .post(url, data)
                .then(function (response) {
                    return response.data;
                })
                .catch(function (error) {
                    return Promise.reject(error);
                });
        } else {
            Swal.fire({
                icon: 'warning',
                title: 'Lưu ý!',
                text: 'Vui lòng đăng nhập trước khi thêm sản phẩm vào giỏ hàng.',
            });
        }
    }

    this.buyNow = function (productDetailId, quantity, username) {
        return this.addToCart(productDetailId, quantity, username);
    }

    this.getCart = function (username) {
        var url = cartAPI + "/getCart?username=" + username;

        return $http
            .get(url)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                return Promise.reject(error);
            });
    };

    this.updateQuantity = function (cartId, quantity) {
        var url = cartAPI + "/updateQuantity";

        var data = {
            cartId: cartId,
            quantity: quantity,
        };

        return $http
            .post(url, data)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                return Promise.reject(error);
            });
    }

    this.removeCartItem = function (cartId) {
        var url = cartAPI + '/remove'

        return $http.post(url, cartId)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                return Promise.reject(error);
            });
    }

    this.removeCartItemSelected = function (listCart) {
        var url = cartAPI + '/removeSelected'

        return $http.post(url, listCart)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                return Promise.reject(error);
            });
    }

});
// =============== PRODUCT SERVICE =============
app.service('ProductDetailService', function ($http, productDetailAPI) {
    this.getProductDetailById = function (productDetailId) {
        var url = `${productDetailAPI}/${productDetailId}`;
        return $http.get(url)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log('Lỗi khi lấy dữ liệu:', error);
                return Promise.reject(error);
            });
    };
    this.hasPurchasedProduct = function (username, productDetailId) {
        var url = `${productDetailAPI}/hasPurchased/${username}/${productDetailId}`;
        return $http.get(url)
            .then(function (response) {
                return response.data;
            })
            .catch(function (error) {
                console.log('Lỗi khi kiểm tra đơn hàng:', error);
                return Promise.reject(error);
            });
    };
});
//=============== NOTIFY SERVICE  ===========
app.service('NotifyService', function ($http, customerAPI) {
    this.getNotificationsByUsername = function (username) {
        return $http.get(customerAPI + '/notifications/' + username)
            .then(function (response) {
                return response.data;
            });
    };

    this.markNotificationAsRead = function (notificationId) {
        return $http.put(customerAPI + '/notifications/' + notificationId + '/markAsRead')
            .then(function (response) {
                return response;
            });
    }
});

//===================SEARCH SERVICE===================//
app.service('SearchDataService', function ($http, customerAPI) {


    this.saveSearchHistory = function (searchHistory) {
        // Thêm giá trị username vào đối tượng searchHistory
        return $http.post(customerAPI + '/saveSearchHistory', searchHistory)
            .then(function (response) {
                // Xóa lịch sử tìm kiếm đã được lưu vào cơ sở dữ liệu khỏi localStorage
                var currentSearchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
                var index = currentSearchHistory.findIndex(item => item.keyword === searchHistory.keyword);
                if (index !== -1) {
                    currentSearchHistory.splice(index, 1);
                    localStorage.setItem('searchHistory', JSON.stringify(currentSearchHistory));
                }

                return response.data;
            });
    };


    // Hàm để lấy lịch sử tìm kiếm từ localStorage
    this.getSearchHistory = function () {
        return JSON.parse(localStorage.getItem('searchHistory')) || [];
    };

    this.addToSearchHistory = function (keyword) {
        // Lấy lịch sử tìm kiếm từ localStorage (nếu có)
        var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        // Thêm mục mới vào đầu mảng
        searchHistory.unshift({
            keyword: keyword,
            searchTime: new Date(),
            username: ''
        });

        // Giới hạn lịch sử tìm kiếm tối đa là 5 mục (có thể thay đổi theo ý muốn)
        if (searchHistory.length > 5) {
            searchHistory = searchHistory.slice(0, 5);
        }

        // Lưu lại vào localStorage
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    };

    //xóa
    this.removeFromSearchHistory = function (index) {
        var searchHistory = JSON.parse(localStorage.getItem('searchHistory')) || [];
        searchHistory.splice(index, 1);
        localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
    };
    // xóa Tất cả
    this.clearSearchHistory = function () {
        localStorage.removeItem('searchHistory');
    };

    this.getSearchData = function () {
        return $http.get(customerAPI + '/getSearchData')
            .then(function (response) {
                return response.data;
            });
    };
});

app.service('NotifyWebSocketService', function ($rootScope) {
    var stompClient = null;
    var isConnecting = false;
    var currentUsername = localStorage.getItem("username"); // Lấy giá trị username từ localStorage

    this.connect = function (callback) {
        if (isConnecting) {
            return;
        }
        isConnecting = true;

        var socket = new SockJS('/notify');
        stompClient = Stomp.over(socket);
        stompClient.connect({}, function (frame) {
            isConnecting = false;
            console.log('Đã kết nối: ' + frame);

            // Sau khi kết nối đã được thiết lập, gọi hàm callback nếu được cung cấp
            if (callback) {
                callback();
            }
        });
    };

    this.subscribeToNotifications = function (callback) {
        if (stompClient && stompClient.connected) {
            stompClient.subscribe('/topic/notifications/' + currentUsername, function (notification) {
                callback(JSON.parse(notification.body));
            });
        } else {
            this.connect(function () {
                this.subscribeToNotifications(callback);
            });
        }
    };

    this.sendNotification = function (title, message) {
        if (stompClient && stompClient.connected) {
            var model = {
                username: { username: currentUsername },
                title: title,
                message: message,
                createAt: new Date()
            };
            stompClient.send("/app/notify", {}, JSON.stringify(model));
        } else {
            this.connect(function () {
                this.sendNotification(title, message);
            });
        }
    };

    this.getNotifications = function (callback) {
        if (stompClient && stompClient.connected) {
            stompClient.send("/app/notify/getNotifications/" + currentUsername, {}, "");
        } else {
            this.connect(function () {
                this.getNotifications(callback);
            });
        }

        stompClient.subscribe('/topic/notifications', function (response) {
            var notifications = JSON.parse(response.body);
            callback(notifications);
        });
    };
});
// Khi trang được nạp, kết nối tới WebSocket
// NotifyWebSocketService.connect(function() {
//     loadNotifications();
// });

// // Thay thế REST API call bằng WebSocket call
// function loadNotifications() {
//     NotifyWebSocketService.getNotifications(function (ListNotifyUser) {
//         $scope.ListNotifyUser = ListNotifyUser;

//         $scope.$apply();
//     });
// }


// $scope.sendNotification = function (title, message) {
//     NotifyWebSocketService.sendNotification(title, message);
//     NotifyWebSocketService.connect(function() {
//         loadNotifications();
//     });
// }