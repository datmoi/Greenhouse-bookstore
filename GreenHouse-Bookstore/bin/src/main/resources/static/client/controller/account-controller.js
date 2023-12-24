app.controller('accountController', accountController);

function accountController($http, $window, $scope, jwtHelper, $timeout) {
    let host = "http://localhost:8081/customer/rest";
    var token = localStorage.getItem('token');
    if (token) {
        var decodedToken = jwtHelper.decodeToken(token);
        $scope.username = decodedToken.sub;
        console.log($scope.username);
        $scope.listAddress = []; // Khởi tạo biến để lưu trữ thông tin địa chỉ
        $scope.listProvince = []; // Danh sách các tỉnh/thành phố
        $scope.listDistrict = []; // Danh sách các quận/huyện tương ứng với tỉnh/thành phố được chọn
        $scope.listWard = []; // Danh sách các phường/xã tương ứng với quận/huyện được chọn
        $scope.modalContent = "";
        $scope.isAddingAddress = true; // Trạng thái mặc định khi ban đầu vào trang là "Thêm địa chỉ"
        $scope.isEditingAddress = false;
        $scope.address = {};
        $scope.account = {};
        $scope.accounts = [];
        $scope.uservoucher = {};

        // Gọi hàm loadData với tên người dùng hiện tại
        $scope.loadData = function (username) {

            var url = `${host}/address/${username}`;
            $http
                .get(url)
                .then(function (resp) {
                    if (resp.data.listAddress) {
                        // Kiểm tra nếu có danh sách địa chỉ
                        $scope.listAddress = resp.data.listAddress;
                    } else {
                        // Không tìm thấy địa chỉ hoặc danh sách địa chỉ trống
                        $scope.listAddress = [];
                        console.log("Không tìm thấy địa chỉ cho người dùng này hoặc danh sách rỗng.");
                    }
                })
                .catch(function (error) {
                    console.log("Error", error);
                });

        }
        $scope.getProvince = function () {
            var url = "https://provinces.open-api.vn/api/?depth=3";

            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    $scope.listProvince = JSON.parse(xhr.responseText);
                }
            };
            xhr.send();
        }

        $scope.getListDistrict = function () {
            var provinceCodeSelected = $scope.selectedProvinceCode;
            var selectedProvince = $scope.listProvince.find(function (province) {
                return province.code === provinceCodeSelected;
            });
            if (selectedProvince) {
                $scope.listDistrict = selectedProvince.districts;
            } else {
                $scope.listDistrict = [];
            }
            $timeout(function () {
                // Thực hiện cập nhật giao diện sau khi thay đổi $scope.listDistrict và $scope.listWard
            });
        };

        $scope.getListWard = function () {
            var districtCodeSelected = $scope.selectedDistrictCode;
            var selectedDistrict = $scope.listDistrict.find(function (district) {
                return district.code === districtCodeSelected;
            });
            if (selectedDistrict) {
                $scope.listWard = selectedDistrict.wards;
            } else {
                $scope.listWard = [];
            }
            $timeout(function () {
                // Thực hiện cập nhật giao diện sau khi thay đổi $scope.listDistrict và $scope.listWard
            });
        };
        //Hàm lưu địa chỉ
        $scope.saveAddress = function () {
            var check = $scope.checkErrors();
            if (check) {
                // Lấy tên của tỉnh, huyện và xã dựa trên mã code đã chọn
                var selectedProvince = $scope.listProvince.find(function (province) {
                    return province.code === $scope.selectedProvinceCode;
                });

                var selectedDistrict = $scope.listDistrict.find(function (district) {
                    return district.code === $scope.selectedDistrictCode;
                });

                var selectedWard = $scope.listWard.find(function (ward) {
                    return ward.code === $scope.selectedWardCode;
                });

                // Tạo một đối tượng Address từ dữ liệu nhập vào, bao gồm tên của tỉnh, huyện, xã và địa chỉ cụ thể
                var newAddress = {
                    id: $scope.address.id | null,
                    fullname: $scope.address.fullname,
                    phone: $scope.address.phone,
                    address: $scope.address.adr + ", " + selectedWard.name + ", " + selectedDistrict.name + ", " + selectedProvince.name,
                    username: $scope.username
                };

                var url = `${host}/profile_address`;
                $http.post(url, newAddress)
                    .then(function (resp) {

                        $scope.loadData($scope.username);
                        $('#createAddressModal').modal('hide');
                        // Hiển thị modal "message"
                        if ($scope.isAddingAddress) {
                            $scope.modalContent = "Thêm địa chỉ thành công";
                        } else {
                            $scope.modalContent = "Cập nhật địa chỉ thành công";
                        }

                        $('#message').modal('show');
                        // Gọi hàm để ẩn modal sau một khoảng thời gian (ví dụ: sau 2 giây)
                        $timeout(function () {
                            $('#message').modal('hide');
                        }, 1000);
                        $scope.resetAddress();

                    })
                    .catch(function (error) {
                        // Xử lý lỗi nếu có
                        console.error("Lỗi khi lưu địa chỉ:", error);
                    });
            }

        };
        //hàm edit địa chỉ
        $scope.editAddress = function (id) {
            $scope.isAddingAddress = false;
            $scope.isEditingAddress = true;

            var url = `${host}/profile_address/${id}`;
            $http.get(url).then(function (resp) {
                var address = resp.data;
                if (address) {
                    $scope.setProvinceByAddress(address);
                } else {
                    console.log("Không tìm thấy địa chỉ với ID này.");
                }
            })
                .catch(function (error) {
                    console.log("Lỗi khi lấy thông tin địa chỉ:", error);
                });
        };

        $scope.setProvinceByAddress = function (address) {
            var addressParts = address.address.split(',');

            if (addressParts.length >= 4) {
                // Lấy các phần tử tương ứng
                var selectedProvinceName = addressParts[3].trim();
                var selectedDistrictName = addressParts[2].trim();
                var selectedWardName = addressParts[1].trim();
                var detailedAddress = addressParts[0].trim();

                // Gán giá trị cho fullname và phone từ đối tượng địa chỉ
                $scope.address = {
                    id: address.id,
                    fullname: address.fullname,
                    phone: address.phone,
                    adr: detailedAddress
                };
                var province = $scope.listProvince.find(function (province) {
                    return province.name === selectedProvinceName;
                });

                console.log(province.code);
                var district = province.districts.find(function (district) {
                    return district.name === selectedDistrictName;
                });
                console.log(district.code);
                var ward = district.wards.find(function (ward) {
                    return ward.name === selectedWardName;
                });
                console.log(ward.code);
                // Gán giá trị cho mã code của tỉnh, quận và xã
                $scope.selectedProvinceCode = province.code;
                $scope.selectedDistrictCode = district.code;
                $scope.selectedWardCode = ward.code;

                $scope.getListDistrict();
                $scope.getListWard();
                // Mở modal chỉnh sửa địa chỉ
                $('#createAddressModal').modal('show');
            }
        }

        $scope.resetAddress = function () {
            // Đặt các trường nhập liệu về giá trị mặc định hoặc rỗng
            $scope.address = {};
            $scope.errors = {};
            // Đặt các giá trị mã code và danh sách về giá trị mặc định
            $scope.selectedProvinceCode = "";
            $scope.selectedDistrictCode = "";
            $scope.selectedWardCode = "";
            $scope.listDistrict = [];
            $scope.listWard = "";
            $scope.isAddingAddress = true;
            $scope.isEditingAddress = false;
        };
        //Model thêm địa chỉ
        $scope.addModel = function () {
            $scope.isAddingAddress = true;
            $scope.isEditingAddress = false;
            // Các công việc khác khi nhấp vào "Thêm địa chỉ"
            $scope.resetAddress();
        };
        /// Hàm hiển thị modal xác nhận
        $scope.showConfirmAddress = function (id) {
            $scope.address.id = id;
            $('#addressDelete').modal('show'); // Hiển thị modal xác nhận
        };

        $scope.deleteAddress = function () {
            var url = `${host}/profile_address/${$scope.address.id}`;
            $('#createAddressModal').modal('hide'); // Đóng modal xác nhận trước (nếu đã mở)
            $http.delete(url)
                .then(function (response) {
                    init();

                    $scope.modalContent = "Xóa địa chỉ thành công";
                    $('#addressDelete').modal('hide');
                    $('#message').modal('show');
                    // Gọi hàm để ẩn modal sau một khoảng thời gian (ví dụ: sau 2 giây)
                    $timeout(function () {
                        $('#message').modal('hide');
                    }, 1500);
                    $scope.resetAddress();
                })
                .catch(function (error) {
                    console.log('Xóa thất bại');
                    // Xử lý lỗi nếu cần
                });

        };
        //BẮt lỗi
        $scope.checkErrors = function () {
            $scope.errors = {};

            // Kiểm tra các điều kiện cho trường fullname
            if ($scope.address.fullname == null) {
                $scope.errors.fullname = 'Vui lòng nhập họ và tên';
            } else if ($scope.address.fullname.length < 10) {
                $scope.errors.fullname = 'Họ và tên phải có ít nhất 10 ký tự';
            }

            var reg = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;
            // Kiểm tra các điều kiện cho trường phone
            if (!$scope.address.phone) {
                $scope.errors.phone = 'Vui lòng nhập số điện thoại';
            } else if (!reg.test($scope.address.phone)) {
                $scope.errors.phone = 'Số điện thoại không đúng định dạng ';
            }

            // Kiểm tra các điều kiện cho trường province
            if (!$scope.selectedProvinceCode) {
                $scope.errors.province = 'Vui lòng chọn tỉnh/thành phố';
            }

            // Kiểm tra các điều kiện cho trường district
            if (!$scope.selectedDistrictCode) {
                $scope.errors.district = 'Vui lòng chọn quận/huyện';
            }

            // Kiểm tra các điều kiện cho trường ward
            if (!$scope.selectedWardCode) {
                $scope.errors.ward = 'Vui lòng chọn xã/phường';
            }

            // Kiểm tra các điều kiện cho trường adr (địa chỉ cụ thể)
            if (!$scope.address.adr) {
                $scope.errors.adr = 'Vui lòng nhập địa chỉ cụ thể';
            }

            // Kiểm tra nếu có bất kỳ lỗi nào xuất hiện
            var hasErrors = Object.keys($scope.errors).length > 0;
            return !hasErrors;
        };

        // UPDATE ACCOUNT --------------------------------------------------------
        $scope.getAccountByUsername = function (username) {
            var url = `${host}/profile_account/${username}`;

            $http.get(url)
                .then(function (response) {
                    // Xử lý dữ liệu tài khoản ở đây
                    $scope.account = response.data;
                    // console.log("Thông tin tài khoản: ", $scope.account);
                })
                .catch(function (error) {
                    console.error("Lỗi khi lấy thông tin tài khoản: ", error);
                });
        }

        $scope.saveAccount = function () {
            var result = $scope.checkErrorAccount();
            var formData = new FormData();
            var fileInput = document.getElementById("fileInput");
            if (fileInput && fileInput.files.length > 0) {
                formData.append("image", fileInput.files[0]);
            }

            if (result.isError) {
                $scope.errorMessages = result.errorMessages;
            } else {
                $scope.errorMessages = {}; // Xóa các thông báo lỗi

                var url = `${host}/profile_account`;
                var newAccount = {
                    username: $scope.username,
                    fullname: $scope.account.fullname,
                    phone: $scope.account.phone,
                    email: $scope.account.email,
                    gender: $scope.account.gender,
                    birthday: $scope.account.birthday,
                    active: true,
                    createdAt: new Date(),
                    deletedAt: null,
                    deletedBy: null,
                };

                formData.append("AccountJson", JSON.stringify(newAccount));

                $http({
                    method: 'POST',
                    url: url,
                    data: formData,
                    headers: {
                        'Content-Type': undefined
                    },
                    transformRequest: angular.identity
                })
                    .then(function (response) {
                        $scope.getAccountByUsername($scope.username);
                        $scope.modalContent = "Cập nhật tài khoản thành công";
                        $('#message').modal('show');
                        $timeout(function () {
                            $('#message').modal('hide');
                        }, 2000);
                    })
                    .catch(function (error) {
                        $scope.modalContent = "Cập nhật tài khoản thất bại. Vui lòng thử lại.";
                        $('#message').modal('show');
                        $timeout(function () {
                            $('#message').modal('hide');
                        }, 2000);
                    });
            }
        };


        //Check error Account
        $scope.checkErrorAccount = function () {
            var isError = false;

            var errorMessages = {
                fullname: '',
                phone: '',
                email: '',
                birthday: ''
            };

            if (!$scope.account.fullname) {
                errorMessages.fullname = 'Vui lòng không bỏ trống họ và tên';
                isError = true;
            }

            var phonePattern = /^(0|\+84)(\s|\.)?((3[2-9])|(5[689])|(7[06-9])|(8[1-689])|(9[0-46-9]))(\d)(\s|\.)?(\d{3})(\s|\.)?(\d{3})$/;

            if (!$scope.account.phone) {
                errorMessages.phone = 'Vui lòng không bỏ trống số điện thoại';
                isError = true;
            } else if (!phonePattern.test($scope.account.phone)) {
                errorMessages.phone = 'Số điện thoại không đúng định dạng';
                isError = true;
            }

            var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!$scope.account.email) {
                errorMessages.email = 'Vui lòng không bỏ trống email';
                isError = true;
            } else if (!emailPattern.test($scope.account.email)) {
                errorMessages.email = 'Email không đúng định dạng';
                isError = true;
            }

            var currentDate = new Date();
            var selectedDate = new Date($scope.account.birthday);

            if (selectedDate > currentDate) {
                errorMessages.birthday = 'Ngày sinh không được là ngày ở tương lai';
                isError = true;
            }

            var result = {
                isError: isError,
                errorMessages: errorMessages
            }

            return result;
        };


        $scope.checkDuplicateEmail = function (email) {
            // Kiểm tra trùng lặp email
            var existingEmail = $scope.accounts.find(function (account) {
                return account.email === email;
            });

            if (existingEmail) {
                return 'Email đã tồn tại.';
            }

            return null; // Chưa tồn tại
        };

        //Format Ngày 
        $scope.formatDate = function (date) {
            if (date == null) {
                return "";
            }
            var formattedDate = new Date(date);
            var year = formattedDate.getFullYear();
            var month = (formattedDate.getMonth() + 1).toString().padStart(2, '0');
            var day = formattedDate.getDate().toString().padStart(2, '0');

            return `${year}-${month}-${day}`;
        };

        //GET VOUCHER-----------------------------------------------------------------------
        $scope.getUserVoucherById = function (username) {
            var url = `${host}/profile_voucher/${username}`;

            $http.get(url)
                .then(function (response) {
                    if (response.data.userVouchersList) {
                        // Kiểm tra nếu có danh sách địa chỉ
                        $scope.uservoucher = response.data.userVouchersList;
                        console.log("Danh Sách Voucher", $scope.uservoucher);
                    } else {
                        // Không tìm thấy địa chỉ hoặc danh sách địa chỉ trống
                        $scope.uservoucher = [];
                        console.log("Không tìm thấy Voucher cho người dùng này hoặc danh sách rỗng.");
                    }
                    // // Xử lý dữ liệu voucher ở đây
                    // $scope.uservoucher = response.data;
                    // console.log("Thông tin voucher: ", $scope.uservoucher);
                })
                .catch(function (error) {
                    console.error("Lỗi khi lấy thông tin voucher: ", error);
                });
        }

    }


    function init() {
        $scope.getAccountByUsername($scope.username);
        $scope.getUserVoucherById($scope.username);
        $scope.loadData($scope.username);
        $scope.getProvince();
    }

    init();
}

// Mã JavaScript cho Javasricpt
function initJavascript() {

    const statusButtons = document.querySelectorAll('.order-status-button');

    statusButtons.forEach(button => {
        button.addEventListener('click', () => {
            statusButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });

    const changePasswordCheckbox = document.getElementById("change_password_checkbox");
    const passwordFields = document.getElementById("password_fields");

    changePasswordCheckbox.addEventListener("change", function () {
        if (this.checked) {
            passwordFields.style.display = "block";
        } else {
            passwordFields.style.display = "none";
        }
    });

}

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