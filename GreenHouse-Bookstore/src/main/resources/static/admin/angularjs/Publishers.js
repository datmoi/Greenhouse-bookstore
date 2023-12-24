app.controller("PublishersController", PublishersController);

function PublishersController($scope, $location, $routeParams, $http) {
  $scope.$on('$routeChangeSuccess', function (event, current, previous) {
    $scope.page.setTitle(current.$$route.title || ' Quản Lý nhà xuất bản');
    $scope.loadPublishers();
  });

  $scope.editingPublisher = {};
  $scope.isEditing = false;
  $scope.publishers = [];
  $scope.searchText = "";

  // Khai báo danh sách tùy chọn cho số mục trên mỗi trang
  $scope.itemsPerPageOptions = [5, 12, 24, 32, 64, 128];
  let host = "http://localhost:8081/rest/publishers";
  $scope.selectedItemsPerPage = 5; // Khởi tạo giá trị mặc định cho số mục trên mỗi trang
  $scope.currentPage = 1; // Trang hiện tại
  $scope.itemsPerPage = 5; // Số mục hiển thị trên mỗi trang
  $scope.totalItems = $scope.publishers.length; // Tổng số mục
  $scope.maxSize = 5; // Số lượng nút phân trang tối đa hiển thị
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

  $scope.loadPublishers = function () {
    var url = `${host}`;
    $http.get(url).then(resp => {
      $scope.originalPublishers = $scope.publishers;
      $scope.publishers = resp.data;
      console.log("success", resp.data);
      $scope.totalItems = $scope.publishers.length;
    }).catch(error => {
      console.log("Error", error);
    });
  }

  $scope.searchData = function () {
    // Lọc danh sách gốc bằng searchText
    $scope.publishers = $scope.originalPublishers.filter(function (publisher) {
      // Thực hiện tìm kiếm trong các thuộc tính cần thiết của item
      return (
        (publisher.publisherId && publisher.publisherId.toString().includes($scope.searchText)) ||
        (publisher.publisherName && publisher.publisherName.toLowerCase().includes($scope.searchText.toLowerCase())) ||
        (publisher.email && publisher.email.toString().includes($scope.searchText))
      );
    });
    $scope.totalItems = $scope.searchText ? $scope.publishers.length : $scope.originalPublishers.length;
    $scope.setPage(1);
  };


  // Lưu thông tin nhà xuất bản
  $scope.savePublisher = function (publisherId) {
    $scope.errorMessages = {
      publisherId: '',
      publisherName: '',
      address: '',
      email: ''
    };

    var formData = new FormData();
    var fileInput = document.getElementById("fileInput");

    var publisherId = $scope.editingPublisher.publisherId;
    var publisherName = $scope.editingPublisher.publisherName;
    var address = $scope.editingPublisher.address;
    var email = $scope.editingPublisher.email;

    // Kiểm tra bỏ trống mã nxb
    if (!publisherId) {
      $scope.errorMessages.publisherId = 'Vui lòng nhập mã nhà xuất bản';
      return;
    }
    // Kiểm tra bỏ trống tên nxb
    if (!publisherName) {
      $scope.errorMessages.publisherName = 'Vui lòng nhập tên nhà xuất bản';
      return;
    }
    // Kiểm tra bỏ trống nxb
    if (!address) {
      $scope.errorMessages.address = 'Vui lòng nhập địa chỉ nhà xuất bản';
      return;
    }
    // Kiểm tra bỏ trống nxb
    if (!email) {
      $scope.errorMessages.email = 'Vui lòng nhập email nhà xuất bản';
      return;
    }

    // // Kiểm tra định dạng mã
    // var publisherIdRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;;
    // if (!publisherIdRegex.test(publisherId)) {
    //   $scope.errorMessages.publisherId = 'Mã nhà xuất bản phải chứa ít nhất 4 ký tự và chỉ được điền kí tự HOA và số';
    //   return;
    // }

    // Kiểm tra trùng lặp publisherId trước khi thêm
    if (!$scope.isEditing) {
      var existingPublisher = $scope.publishers.find(function (publisher) {
        return publisher.publisherId === $scope.editingPublisher.publisherId;
      });

      if (existingPublisher) {
        // Gán thông báo lỗi vào $scope.errorMessages.publisherId
        $scope.errorMessages.publisherId = `Mã Nhà xuất bản "${$scope.editingPublisher.publisherId}" đã tồn tại. Vui lòng chọn mã khác.`;
        return; // Không tiếp tục lưu nếu có lỗi
      }
    }

    // Kiểm tra trùng lặp publisherName trước khi thêm
    var existingPublisherName = $scope.publishers.find(function (publisher) {
      return (
        publisher.publisherName === $scope.editingPublisher.publisherName &&
        publisher.publisherId !== $scope.editingPublisher.publisherId
      );
    });
    if (existingPublisherName) {
      // Hiển thị thông báo lỗi nếu tên nhà xuất bản đã tồn tại
      $scope.errorMessages.publisherName = `Tên Nhà xuất bản "${$scope.editingPublisher.publisherName}" đã tồn tại. Vui lòng chọn tên khác.`;
      return; // Không tiếp tục lưu nếu có lỗi
    }

    // Kiểm tra định dạng email Gmail
    function isGmail(email) {
      var emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
      return emailRegex.test(email);
    }
    if (!isGmail($scope.editingPublisher.email)) {
      // Hiển thị thông báo lỗi nếu email không đúng định dạng Gmail
      $scope.errorMessages.email = `Email "${$scope.editingPublisher.email}" không đúng định dạng Gmail. Vui lòng kiểm tra lại.`;
      return; // Không tiếp tục lưu nếu có lỗi
    }

    // Kiểm tra trùng lặp email trước khi thêm
    var existingEmail = $scope.publishers.find(function (publisher) {
      return (
          publisher.email === $scope.editingPublisher.email &&
          publisher.publisherId !== $scope.editingPublisher.publisherId
      );
    });
      if (existingEmail) {
          // Hiển thị thông báo lỗi nếu email đã tồn tại
          $scope.errorMessages.email = `Email "${$scope.editingPublisher.email}" đã tồn tại. Vui lòng chọn email khác.`;
          return; // Không tiếp tục lưu nếu có lỗi
      }

      // // Hiển thị hiệu ứng loading
      // document.addEventListener("DOMContentLoaded", function () {
      //   // Đoạn mã JavaScript của bạn ở đây
      //   var loadingOverlay = document.getElementById("loadingOverlay");
      //   loadingOverlay.style.display = "block";

      // });


      if (fileInput && fileInput.files.length > 0) {
          formData.append("image", fileInput.files[0]);
      }


    formData.append(
      "publisherJson",
      JSON.stringify({
        publisherId: $scope.editingPublisher.publisherId || "",
        publisherName: $scope.editingPublisher.publisherName || "",
        description: $scope.editingPublisher.description || "",
        address: $scope.editingPublisher.address || "",
        email: $scope.editingPublisher.email || "",
        image: $scope.editingPublisher.image || "",
      })
    );

    if ($scope.isEditing) {
        // Ẩn hiệu ứng loading khi lưu thành công
        // loadingOverlay.style.display = "none";

      // Sử dụng hộp thoại xác nhận từ thư viện Swal
      Swal.fire({
        title: 'Xác nhận cập nhật',
        text: `Bạn có muốn cập nhật nhà xuất bản "${publisherId}" không?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Cập nhật',
        cancelButtonText: 'Hủy',
      }).then((result) => {
        if (result.isConfirmed) {
            // Hiển thị hiệu ứng loading khi người dùng xác nhận cập nhật
            // loadingOverlay.style.display = "block";
          var url = `${host}/${$scope.editingPublisher.publisherId}`;
          $http
            .put(url, formData, {
              transformRequest: angular.identity,
              headers: { "Content-Type": undefined },
            })
            .then((resp) => {
                // Ẩn hiệu ứng loading khi lưu thành công
                // loadingOverlay.style.display = "none";

              $scope.loadPublishers();
              $scope.resetForm();
              Swal.fire({
                icon: "success",
                title: "Thành công",
                text: `Cập nhật nhà xuất bản "${publisherId}" thành công`,
              });
              $scope.clearImage(); // Xóa ảnh đại diện sau khi cập nhật
            })
            .catch((error) => {
                // Ẩn hiệu ứng loading khi lưu thành công
                // loadingOverlay.style.display = "none";

              Swal.fire({
                icon: "error",
                title: "Thất bại",
                text: `Cập nhật nhà xuất bản "${publisherId}" thất bại`,
              });
            });
        } else {
          // Nếu người dùng chọn Hủy, bạn có thể thực hiện hành động nào đó, hoặc không làm gì cả.
          // Ví dụ: không thực hiện cập nhật và trở lại biểu mẫu.
        }
      });
    } else {
      var url = `${host}`;
      $http.post(url, formData, {
        transformRequest: angular.identity,
        headers: {
          "Content-Type": undefined,
        },
      })
        .then((resp) => {
            // Ẩn hiệu ứng loading khi lưu thành công
            // loadingOverlay.style.display = "none";

          $scope.loadPublishers();
          $scope.resetForm();
          Swal.fire({
            icon: "success",
            title: "Thành công",
            text: `Thêm nhà xuất bản "${publisherId}"`,
          });
          $scope.clearImage(); // Xóa ảnh đại diện sau khi thêm
        })
        .catch((error) => {
            // Ẩn hiệu ứng loading khi lưu thành công
            // loadingOverlay.style.display = "none";

          console.log(error.data);
          if (error.data) {
            Swal.fire({
              icon: "error",
              title: "Thất bại",
              text: `Thêm nhà xuất bản "${publisherId}" thất bại`,
            });
          }
        });
    }
  };

  // Chỉnh sửa thông tin nhà xuất bản và chuyển hướng
  $scope.editPublisherAndRedirect = function (publisherId) {
    var url = `${host}/${publisherId}`;
    $http
      .get(url)
      .then(function (resp) {
        $scope.editingPublisher = angular.copy(resp.data);
        $scope.isEditing = true;

        // Chuyển hướng đến trang chỉnh sửa thông tin nhà xuất bản và truyền dữ liệu nhà xuất bản.
        // Sử dụng $location.search để thiết lập tham số trong URL.
        $location
          .path("/publisher-form")
          .search({ id: publisherId, data: angular.toJson(resp.data) });
      })
      .catch(function (error) {
        console.log("Error", error);
      });
  };

  // Kiểm tra xem có tham số data trong URL không.
  if ($routeParams.data) {
    // Parse dữ liệu từ tham số data và gán vào editingPublisher.
    $scope.editingPublisher = angular.fromJson($routeParams.data);
    $scope.isEditing = true;
  }

  // Xóa nhà xuất bản
  $scope.deletePublisher = function (publisherId) {
    Swal.fire({
      title: 'Xác nhận xóa',
      text: `Bạn có muốn xóa nhà xuất bản "${publisherId}" không?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    }).then((result) => {
      if (result.isConfirmed) {
        var url = `${host}/${publisherId}`;
        $http
          .delete(url)
          .then(function (resp) {
            if (resp.status === 200) {
              $scope.loadPublishers();
              Swal.fire({
                icon: "success",
                title: "Thành công",
                text: `Xóa ID ${publisherId} thành công `,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Thất bại",
                text: `Không thể xóa NXB ${publisherId} đang sử dụng `,
              });
            }
          })
          .catch(function (error) {
            Swal.fire({
              icon: "error",
              title: "Thất bại",
              text: `Xóa ID ${publisherId} thất bại `,
            });
          });
      }
    });
  };
  // Xóa ảnh đại diện và làm mới form
  $scope.clearImage = function () {
    $scope.editingPublisher.image = "/admin/assets/images/default.jpg";
    var imageElement = document.getElementById("uploadedImage");
    imageElement.src = "/admin/assets/images/default.jpg";
    var fileInput = document.getElementById("fileInput");
    fileInput.value = null;
  };

  // Làm mới form
  $scope.resetForm = function () {
    $scope.editingPublisher = {};
    $scope.isEditing = false;
    $scope.clearImage(); // Xóa ảnh đại diện khi làm mới form
    $location.search('id', null);
    $location.search('data', null);

    // Sau khi xóa, chuyển hướng lại đến trang /flashsale-form
    $location.path('/publisher-form');
  };
  // Sử dụng $location.search() để xóa tham số "id" và "data" khỏi URL
  $scope.exportToExcel = function () {
    // Lấy toàn bộ dữ liệu từ server khi tải trang ban đầu
    $scope.loadPublishers();

    // Bây giờ, $scope.publishers sẽ chứa toàn bộ dữ liệu từ tất cả các trang

    // Tạo mảng dữ liệu cho tệp Excel
    var excelData = [
      ['BÁO CÁO - DANH SÁCH NHÀ XUẤT BẢN'], // Header
      [], // Empty row for spacing
      ['#', 'ID', 'Tên nhà xuất bản', 'Mô tả', 'Địa chỉ', 'Email']
    ];

    $scope.publishers.forEach(function (item, index) {
      excelData.push([
        index + 1,
        item.publisherId,
        item.publisherName || '',  // Sử dụng '' nếu giá trị là null
        item.description || '',
        item.address || '',
        item.email || '',
      ]);
    });

    // Đặt độ rộng cố định cho từng cột
    var colWidths = [10, 15, 30, 50, 15, 20];

    // Sử dụng thư viện XLSX để tạo tệp Excel
    var ws = XLSX.utils.aoa_to_sheet(excelData);

    // Đặt độ rộng cố định cho các cột
    for (var i = 0; i < colWidths.length; i++) {
      ws['!cols'] = ws['!cols'] || [];
      ws['!cols'].push({ wch: colWidths[i] });
    }

    // Căn giữa dữ liệu trong từng cột
    for (var row = 0; row < excelData.length; row++) {
      for (var col = 0; col < excelData[row].length; col++) {
        ws[XLSX.utils.encode_cell({ r: row, c: col })].s = { alignment: { horizontal: 'center' } };
      }
    }

    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh sách nhà xuất bản');

    // Xuất tệp Excel
    XLSX.writeFile(wb, 'danh_sach_nha_xuat_ban.xlsx');
  }


  // Định nghĩa hàm formatDate để định dạng ngày in
  function formatDate(date) {
    var options = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    };
    return date.toLocaleString('en-US', options);
  }


  $scope.printPDF = function () {
    var headerTable = {
      table: {
        headerRows: 1,
        widths: [30, 60, 100, 100, 80, 90],
        body: [
          [{ text: '#', alignment: 'center', fontSize: 11 }, // Căn giữa cột '#'
          { text: 'ID', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Mã hóa đơn'
          { text: 'Tên nhà xuất bản', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Tên khách hàng'
          { text: 'Mô tả', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Ngày tạo'
          { text: 'Địa chỉ', alignment: 'center', fontSize: 11 }, // Căn giữa cột 'Tổng tiền'
          { text: 'Email', alignment: 'center', fontSize: 11 }] // Căn giữa cột 'Phí ship'
        ]
      }
    };

    var bodyTable = {
      table: {
        widths: [30, 60, 100, 100, 80, 90],
        body: $scope.publishers.map((item, index) => [
          { text: (index + 1).toString(), alignment: 'center', fontSize: 11 }, // Đặt kích thước font cho cột '#'
          { text: item.publisherId, alignment: 'center', fontSize: 11 }, // Đặt kích thước font cho cột 'Mã hóa đơn'
          { text: item.publisherName, fontSize: 11 },
          { text: item.description, fontSize: 11 }, // Không đặt kích thước font cho cột 'Tên khách hàng'
          { text: item.address, fontSize: 11 },
          { text: item.email, fontSize: 11 },
        ])
      }
    };

    var docDefinition = {
      pageOrientation: 'portrait',
      pageSize: 'A4',
      content: [
        { text: 'Danh sách nhà xuất bản', style: 'header' },
        ' ',
        { text: 'Ngày in: ' + moment().format('DD/MM/YYYY'), alignment: 'right', fontSize: 12 },
        ' ',
        headerTable,
        bodyTable
      ],
      styles: {
        header: { fontSize: 16, bold: true, alignment: 'center' },
        default: { fontSize: 14 }
      }
    };

    pdfMake.createPdf(docDefinition).open();
  };

  // Load danh sách nhà xuất bản khi controller được khởi tạo
  $scope.loadPublishers();
}
