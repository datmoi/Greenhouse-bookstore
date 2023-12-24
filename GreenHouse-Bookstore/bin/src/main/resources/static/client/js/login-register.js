// Gán sự kiện khi modal quên mật khẩu hiển thị
$('#forgotPasswordModal').on('show.bs.modal', function () {
    // Ẩn modal đăng nhập
    $('#loginModal').modal('hide');
});

// Gán sự kiện khi modal đăng ký hiển thị
$('#siginModal').on('show.bs.modal', function () {
    // Ẩn modal quên mật khẩu và đăng nhập
    $('#forgotPasswordModal').modal('hide');
    $('#loginModal').modal('hide');
});

// Gán sự kiện khi modal đăng nhập hiển thị
$('#loginModal').on('show.bs.modal', function () {
    // Ẩn modal quên mật khẩu và đăng ký
    $('#forgotPasswordModal').modal('hide');
    $('#siginModal').modal('hide');
});

// Mở modal quên mật khẩu và ẩn modal đăng nhập/đăng ký
function openForgotPasswordModal() {
    $('#forgotPasswordModal').modal('show');
    $('#loginModal').modal('hide');
    $('#siginModal').modal('hide');
}




