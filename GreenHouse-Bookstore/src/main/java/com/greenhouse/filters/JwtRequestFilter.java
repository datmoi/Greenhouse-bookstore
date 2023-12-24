package com.greenhouse.filters;

import com.greenhouse.util.JwtUtil;

import io.jsonwebtoken.ExpiredJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                if (!jwtUtil.isTokenExpired(token)) {
                    // Token hết hạn
                    handleExpiredToken(response);
                    return;
                }
            } catch (ExpiredJwtException ex) {
                // Xử lý lỗi khi token hết hạn
                handleExpiredToken(response);
                return;
            }
        }

        // Cho phép tiếp tục xử lý yêu cầu
        filterChain.doFilter(request, response);
    }

    private void handleExpiredToken(HttpServletResponse response) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json;charset=UTF-8");
        String errorMessage = "{\"error\": \"Token hết hạn. Vui lòng đăng nhập lại.\"}";
        response.getWriter().write(errorMessage);
    }

}
