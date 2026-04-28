package com.smartcampus.demo.Config;

import com.smartcampus.demo.Service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.Customizer;
import org.springframework.security.crypto.password.NoOpPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private OAuth2AuthenticationSuccessHandler oauth2SuccessHandler;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(csrf -> csrf.disable())
            .authenticationProvider(authenticationProvider())
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/login", "/register", "/oauth2/**", "/error").permitAll()
                .requestMatchers("/api/v1/oauth2-debug", "/api/v1/auth/register").permitAll()
                .requestMatchers("/api/v1/courses/getall", "/api/v1/facility-assets/public").permitAll()
                .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/bookings/all").hasAnyRole("ADMIN", "TECHNICIAN")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/v1/bookings/*/status").hasAnyRole("ADMIN", "TECHNICIAN")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/v1/bookings/*").hasAnyRole("ADMIN", "TECHNICIAN")
                .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/v1/maintenance-tickets/all").hasAnyRole("ADMIN", "TECHNICIAN")
                .requestMatchers(org.springframework.http.HttpMethod.PUT, "/api/v1/maintenance-tickets/*/status").hasAnyRole("ADMIN", "TECHNICIAN")
                .requestMatchers(org.springframework.http.HttpMethod.DELETE, "/api/v1/maintenance-tickets/*").hasAnyRole("ADMIN", "TECHNICIAN")
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl(frontendUrl + "/", true)
                .failureUrl(frontendUrl + "/login?error=true")
                .permitAll()
            )
            .oauth2Login(oauth2 -> oauth2
                .successHandler(oauth2SuccessHandler)
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl(frontendUrl + "/login")
                .permitAll()
            );
        
        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(Arrays.asList(
            frontendUrl,
            "http://localhost:8089"
        ));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(Arrays.asList("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return NoOpPasswordEncoder.getInstance();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
}

