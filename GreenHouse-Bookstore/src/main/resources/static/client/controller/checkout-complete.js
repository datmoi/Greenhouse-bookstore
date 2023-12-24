app.controller("checkoutCompleteController", function ($scope, $http, checkoutAPI) {

    $scope.invoice = [];
    $scope.order = [];
    $scope.invoiceDetails = [];
    $scope.orderDetails = [];
    $scope.invoiceMV = [];
    //================================================
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, '\\$&');
        var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
            results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, ' '));
    }
    //================================================
    var socket = new SockJS('/notify');
    var stompClient = Stomp.over(socket);

    // $scope.username1 = '114069353350424347080';

    // Kết nối đến WebSocket
    stompClient.connect({}, function (frame) {
        console.log("Checkout Connected: " + frame);

        // Hàm để gửi thông báo
        $scope.sendNotification = function (title, orderCode, username, message) {
            var notification = {
                username: { username: username },
                title: title + " (" + orderCode + ")",
                message: message,
                createAt: new Date()
            };
            console.log("notification", notification);
            // Gửi thông báo đến phía server
            stompClient.send("/app/notify/" + username, {}, JSON.stringify(notification));
        };
        getData();
    });
    function getData() {
        var currentURL = window.location.href;
        var startIndex = currentURL.indexOf("payment-callback?");
        if (startIndex === -1) {
            var api = `${checkoutAPI}/getCheckoutCompleteData`;
            $http.get(api)
                .then(function (response) {
                    console.log("Dữ liệu CHECKOUT COMPLETE từ API:", response.data);
                    $scope.invoice = response.data.invoice;
                    $scope.order = response.data.order;
                    $scope.invoiceDetails = response.data.invoiceDetails;
                    $scope.orderDetails = response.data.orderDetails;
                    $scope.invoiceMV = response.data.invoiceMV;
                    if (response.data.status == "success") {
                        $scope.payment_status = true;
                        $scope.sendNotification("Thanh toán thành công cho đơn hàng ", $scope.order.orderCode, $scope.order.username, "Bạn đã đặt hàng thành công!!! ");

                    } else {
                        $scope.payment_status = false;
                        $scope.sendNotification("Thanh toán thất bại cho đơn hàng ", $scope.order.orderCode, $scope.order.username, "Bạn đã đặt hàng thất bại!!! ");

                    }
                })
                .catch(function (error) {
                    console.error('Error calling API:', error);
                });
        } else {
            if (currentURL.indexOf("vnp_TxnRef") > -1) {
                var vnPayData = {
                    vnp_Amount: getParameterByName('vnp_Amount'),
                    vnp_BankCode: getParameterByName('vnp_BankCode'),
                    vnp_BankTranNo: getParameterByName('vnp_BankTranNo'),
                    vnp_CardType: getParameterByName('vnp_CardType'),
                    vnp_OrderInfo: getParameterByName('vnp_OrderInfo'),
                    vnp_PayDate: getParameterByName('vnp_PayDate'),
                    vnp_ResponseCode: getParameterByName('vnp_ResponseCode'),
                    vnp_TmnCode: getParameterByName('vnp_TmnCode'),
                    vnp_TransactionNo: getParameterByName('vnp_TransactionNo'),
                    vnp_TransactionStatus: getParameterByName('vnp_TransactionStatus'),
                    vnp_TxnRef: getParameterByName('vnp_TxnRef'),
                    vnp_SecureHash: getParameterByName('vnp_SecureHash')
                };

                var url = `${checkoutAPI}/vnPay-payment-callback`;
                $http({
                    method: 'POST',
                    url: url,
                    data: vnPayData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function (response) {
                    window.location.href = "/checkout-complete";
                }).catch(function (error) {
                    console.error("Lỗi khi gọi API:", error);
                });
            } else {
                var payOSData = {
                    code: getParameterByName('code'),
                    id: getParameterByName('id'),
                    cancel: getParameterByName('cancel'),
                    status: getParameterByName('status'),
                    orderCode: getParameterByName('orderCode')
                };

                var url = `${checkoutAPI}/payOS-payment-callback`;
                $http({
                    method: 'POST',
                    url: url,
                    data: payOSData,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function (response) {
                    window.location.href = "/checkout-complete";
                }).catch(function (error) {
                    console.error("Lỗi khi gọi API:", error);
                });
            }
        }
    }


    // Thêm biến selectedSt
    //----------------------------------------------------------------
    $scope.VNnum2words = function (num) {
        return VNnum2words(parseInt(num));
    };

    // function init() {
    //     getData();
    // }

    // init();
});