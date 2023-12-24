// Thêm 'WebSocketService' vào danh sách dependencies của controller
app.controller('flashSaleController', ['$http', '$scope', '$interval', 'WebSocketService',
    function ($http, $scope, $interval, WebSocketService) {
        let host = "http://localhost:8081/customer/rest/productFlashSales";
        var params = new URLSearchParams(location.search);
        var productDetailId = params.get('id');
        $scope.productDetailId = productDetailId;

        $scope.visibleFlashSaleCount = 8;

        $scope.loadMoreFlashSaleToday = function () {
            $scope.visibleFlashSaleCount += 8;
        };
        $scope.productFlashSales = [];
        // Hàm load dữ liệu
        $scope.loadData = function () {
            // Tạo mảng promise cho cả hai yêu cầu HTTP
            var promises = [
                $http.get(`${host}`),
                $http.get("http://localhost:8081/customer/rest/flashSales"),
                $http.get("http://localhost:8081/customer/rest/getProductDetail")
            ];

            // Sử dụng Promise.all để chờ cả hai promise hoàn thành
            Promise.all(promises)
                .then((responses) => {
                    // responses[0] chứa kết quả của yêu cầu đầu tiên
                    // responses[1] chứa kết quả của yêu cầu thứ hai
                    $scope.productFlashSales = filterData(responses[0].data);
                    $scope.flashSales = responses[1].data;
                    $scope.productDetails = responses[2].data;
                    $scope.showCountdownProd = checkAndDisplayCountdownForProductDetail($scope.productDetailId, $scope.productFlashSales);
                    $scope.discountPercentage = getDiscountPercentageForProduct($scope.productDetailId, $scope.productFlashSales);
                   
                    if (!$scope.flashSales.some(flash => flash.status === 2)) {
                        $scope.showSection = false;
                    } else {
                        $scope.showSection = true;
                        console.log("DỮ LIỆU SẢN PHẨM FLASH SALES ");
                        startCountdown();
                    }
                })
                .catch((error) => {
                    console.log("Error", error);
                });
        };
      
        $scope.hasDiscount = function (productDetailId) {
            // Kiểm tra nếu cả $scope.productFlashSales và $scope.productDetails tồn tại và không phải là undefined
            if ($scope.productFlashSales && $scope.productFlashSales.length > 0 ) {
                var discountValue = null;
                // Lọc từ listProductFlashSale để tìm discountValue
                $scope.productFlashSales.find(e => {
                    if (e.productDetail.productDetailId === productDetailId) {
                        discountValue = e.discountPercentage
                    }
                });
            }
            return discountValue ? discountValue : 0;
        };
        $scope.getQuantitySold = function (productDetailId) {
            // Tìm sản phẩm chi tiết trong danh sách sản phẩm flash sale
            var flashSaleProduct = $scope.productFlashSales.find(function (flashSale) {
                return flashSale.productDetail.productDetailId === productDetailId;
            });
        
            // Trả về số lượng đã bán hoặc 0 nếu không tìm thấy
            return flashSaleProduct ? flashSaleProduct.usedQuantity : 0;
        };
        $scope.getQuantityFl = function (productDetailId) {
            // Tìm sản phẩm chi tiết trong danh sách sản phẩm flash sale
            var flashSaleProduct = $scope.productFlashSales.find(function (flashSale) {
                return flashSale.productDetail.productDetailId === productDetailId;
            });
            // Trả về số lượng đã bán hoặc 0 nếu không tìm thấy
            return flashSaleProduct ? flashSaleProduct.quantity : 0;
        };
        // Hàm lọc dữ liệu
        function filterData(data) {
            var currentDate = new Date();

            return data.filter((proFlaSal) => {
                // Lấy ngày từ userDate của Flash_Sales
                var flashSaleDate = new Date(proFlaSal.flashSaleId.userDate);

                return (
                    flashSaleDate.toDateString() === currentDate.toDateString() &&
                    isWithinTimeFrame(proFlaSal.flashSaleId.startTime, proFlaSal.flashSaleId.endTime) &&
                    proFlaSal.flashSaleId.status === 2
                );
            });
        }
        function checkAndDisplayCountdownForProductDetail(productDetailId, productFlashSales) {
            var showCountdown = false;

            angular.forEach(productFlashSales, function (flashSale) {
                if (flashSale.productDetail.productDetailId == productDetailId) {
                    showCountdown = true;
                    return;
                }
            });

            return showCountdown;
        }
        function getDiscountPercentageForProduct(productDetailId, productFlashSales) {
            var flashSale = productFlashSales.find(function (flashSale) {
                return flashSale.productDetail.productDetailId == productDetailId;
            });

            return flashSale ? flashSale.discountPercentage : null;
        }

        function isWithinTimeFrame(startTime, endTime) {
            var currentTime = new Date();
            var formattedStartTime = moment(startTime, 'HH:mm:ss').toISOString();
            var formattedEndTime = moment(endTime, 'HH:mm:ss').toISOString();

            var startDate = new Date(formattedStartTime);
            var endDate = new Date(formattedEndTime);

            // Kiểm tra nếu currentTime nằm trong khoảng thời gian của flash sale
            return startDate <= currentTime && currentTime <= endDate;
        }

        // Hàm kiểm tra điều kiện ngày và thời gian
        // function checkDateAndTime(userDate) {
        //     // Lấy ngày hiện tại
        //     var currentDate = new Date();
        //     // Lấy ngày từ userDate của Flash_Sales
        //     var flashSaleDate = new Date(userDate);
        //     return flashSaleDate.toDateString() === currentDate.toDateString();
        // }
        function startCountdown() {
            $interval(function () {
                angular.forEach($scope.flashSales, function (flash) {
                    var currentTime = new Date();
                    var formattedStartTime = moment(flash.startTime, 'HH:mm:ss').toISOString();
                    var formattedEndTime = moment(flash.endTime, 'HH:mm:ss').toISOString();

                    var startTime = new Date(formattedStartTime);
                    var endTime = new Date(formattedEndTime);
                    var userDate = new Date(flash.userDate);

                    if (userDate > currentTime || startTime > currentTime) {
                        flash.showCountdown = false;

                        // Nếu userDate hoặc startTime lớn hơn currentTime, không bắt đầu đếm ngược
                        return;
                    }

                    if (endTime < currentTime) {
                        flash.showCountdown = false;

                        // Nếu endTime nhỏ hơn currentTime, ngừng đếm ngược
                        flash.hours = '00';
                        flash.minutes = '00';
                        flash.seconds = '00';
                        return;
                    }

                    flash.showCountdown = true;

                    var timeDiff = endTime - currentTime;
                    var seconds = Math.floor((timeDiff / 1000) % 60);
                    var minutes = Math.floor((timeDiff / 1000 / 60) % 60);
                    var hours = Math.floor((timeDiff / (1000 * 60 * 60)) % 24);

                    // Gán giá trị cho các biến thời gian đếm ngược trong $scope
                    flash.hours = hours < 10 ? '0' + hours : hours;
                    flash.minutes = minutes < 10 ? '0' + minutes : minutes;
                    flash.seconds = seconds < 10 ? '0' + seconds : seconds;

                });
            }, 1000);
        }

        $scope.isWebSocketConnected = false;

        $scope.connectWebSocket = function () {
            WebSocketService.connect(function () {
                $scope.isWebSocketConnected = true;

                // Đăng ký cho đường dẫn /topic/products (ví dụ)
                WebSocketService.subscribeToTopic('/topic/products', function (message) {
                    console.log("Received Product Update:", message);
                    $scope.loadData();
                });
            });
        }

        // Gọi hàm connectWebSocket khi controller được khởi tạo
        $scope.connectWebSocket();

        // Gọi hàm load dữ liệu khi controller được khởi tạo
        $scope.loadData();


    }]);