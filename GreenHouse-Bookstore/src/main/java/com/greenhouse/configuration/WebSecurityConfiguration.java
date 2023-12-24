package com.greenhouse.configuration;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.ClientAuthenticationMethod;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.greenhouse.filters.JwtRequestFilter;
import com.greenhouse.model.Accounts;
import com.greenhouse.model.Authorities;
import com.greenhouse.repository.AccountRepository;
import com.greenhouse.repository.AuthoritiesRepository;

@Configuration
@EnableWebSecurity
public class WebSecurityConfiguration {
    @Autowired
    private JwtRequestFilter requestFilter;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private AuthoritiesRepository authoritiesRepository;

    private final String[] securedApiEndpoints = {"/admin/**", "/rest/**"};
    private final String[] publicApiEndpoints = {"/authenticate", "/resgister", "/index", "/login",
            "/login-processing", "/login-error", "/404",
            "/sign-up/**", "/contact", "/voucher", "/flash-sale", "/product",
            "/product-details", "/forgot-password", "/change-password", "/customer/**", "/oauth2/authorization/google",
            "/account/**",
            "/logout", "/google-processing", "/google-success", "/client/**", "/send/**",
            "/notify/**", "/topic/**", "/app/**", "/admin/css/app-dark.css", "/ghn/**", "/websocket/**",
            "/bao-hanh", "/bao-mat-thanh-toan", "/chinh-sach-bao-mat", "/dieu-khoan-su-dung", "/doi-tra", "/he-thong",
            "/hinh-thuc-thanh-toan", "/khach-hang-tiem-nang", "/van-chuyen"};
    private final String[] securedApiEndpointsAfterLogin = {"/account/**", "/cart/**", "/checkout/**",
            "/checkout-complete/**", "/admin/**"};

    @Bean
    UserDetailsService userDetailsService() {
        return new UserDetailsService() {
            @Override
            public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
                // Lấy thông tin người dùng từ cơ sở dữ liệu
                Accounts accounts = accountRepository.findByUsernameAndActiveIsTrue(username);
                List<Authorities> authorities = authoritiesRepository.findByUsername(username);

                if (accounts == null) {
                    throw new UsernameNotFoundException("Không tim thấy tài khoản");
                }

                // Tạo danh sách các quyền từ danh sách Authorities
                List<GrantedAuthority> authoritiesList = authorities.stream()
                        .map(authority -> new SimpleGrantedAuthority("ROLE_" + authority.getRole().getRole()))
                        .collect(Collectors.toList());
                return new User(accounts.getUsername(), accounts.getPassword(), authoritiesList);
            }
        };
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http.csrf().disable()
                .authorizeHttpRequests()
                .requestMatchers(publicApiEndpoints)
                .permitAll().and()
                .authorizeHttpRequests()
                .requestMatchers(securedApiEndpoints)
                .hasAnyRole("ADMIN", "STAFF")
                .and()
                .authorizeHttpRequests()
                .requestMatchers(securedApiEndpointsAfterLogin)
                .hasAnyRole("ADMIN", "CUSTOMER", "STAFF")
                .and()
                .formLogin(login -> {
                    try {
                        login.loginPage("/login")
                                .loginProcessingUrl("/login")
                                .defaultSuccessUrl("/login-processing", true)
                                .failureUrl("/login-error")
                                .and()
                                .exceptionHandling(exception -> exception.accessDeniedPage("/404"));
                    } catch (Exception e) {
                        e.printStackTrace();
                    }
                })
                .oauth2Login().loginPage("/login")
                .defaultSuccessUrl("/google-processing", true)
                .and()
                .logout()
                .logoutUrl("/logout") // Định nghĩa URL để thực hiện logout
                .clearAuthentication(true) // Xóa thông tin xác thực
                // .invalidateHttpSession(true) // Huỷ phiên làm việc
                .permitAll().and()
                .exceptionHandling()
                .accessDeniedPage("/404")
                .and().addFilterBefore(requestFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    ClientRegistrationRepository clientRegistrationRepository() {
        return new InMemoryClientRegistrationRepository(this.googleClientRegistration());
    }

    private ClientRegistration googleClientRegistration() {
        return ClientRegistration.withRegistrationId("google")
                .clientId("615362937868-fhjof66imgsvbcc074mprese8dp376bt.apps.googleusercontent.com")
                .clientSecret("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")
                .clientAuthenticationMethod(ClientAuthenticationMethod.CLIENT_SECRET_BASIC)
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .scope("openid", "profile", "email")
                .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
                .tokenUri("https://www.googleapis.com/oauth2/v4/token")
                .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
                .userNameAttributeName(IdTokenClaimNames.SUB)
                .jwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
                .clientName("Google")
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

}
