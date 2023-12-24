app.controller("checkoutController", function ($scope, $http, checkoutAPI, $timeout) {

    $scope.checkoutDataPayment = {};
    // SCOPE DECLARE - START
    $scope.infoReceiver = {};

    $scope.products = [];

    $scope.totalAmount = 0;
    $scope.totalPaymentAmount = 0;
    $scope.shippingFee = 0;
    // SCOPE DECLARE - END
    //=====================================================================================================================
    //=====================================================================================================================

    function getData() {
        var api = `${checkoutAPI}/getData`;
        $http.get(api)
            .then(function (response) {
                if (response.data.status == "success") {
                    console.log("Dữ liệu CHECKOUT từ API:", response.data);
                    var checkoutData = response.data.checkoutData;
                    $scope.checkoutDataPayment = checkoutData;
                    $scope.infoReceiver = {
                        to_name: checkoutData.to_name,
                        to_phone: checkoutData.to_phone,
                        to_address: checkoutData.to_address,
                        to_district_id: checkoutData.to_district_id,
                        to_ward_code: checkoutData.to_ward_code,
                    };
                    $scope.products = checkoutData.carts;
                    $scope.totalAmount = checkoutData.total_amount;
                    $scope.totalPaymentAmount = checkoutData.payment_total;
                    $scope.shippingFee = checkoutData.shipping_fee;
                } else {
                    console.log(response.data.message);
                }
            })
            .catch(function (error) {
                console.error('Error calling API:', error);
            });
    }
    //----------------------------------------------------------------
    $scope.VNnum2words = function (num) {
        return VNnum2words(parseInt(num));
    };

    //================================================================
    $scope.checkout = function () {
        $scope.showLoading();
        var api = `${checkoutAPI}/create-payment`;
        $scope.checkoutDataPayment.payment_method = $scope.paymentMethod;
        var data = $scope.checkoutDataPayment;
        console.log("Dữ liệu gửi về API để thanh toán: ", data);
        $http.post(api, data)
            .then(function (response) {
                if (response.data.status == "success") {
                    if (response.data.url) {
                        window.location.href = response.data.url;
                    }
                }
            })
            .catch(function (error) {
                console.error('Error calling API:', error);
            }).finally(() => {
            // Sau khi hoàn thành gọi API (thành công hoặc thất bại), đặt isLoading lại thành false.
            $scope.hideLoading();
        });
    }

    // ----------------------------------------------------------------

    function init() {
        getData();
    }

    init();
});