package com.smartcampus.demo.Service;

import com.smartcampus.demo.Entity.User;
import com.smartcampus.demo.Repo.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        User user = userRepo.findByUsername(usernameOrEmail);

        if (user == null) {
            user = userRepo.findByEmail(usernameOrEmail);
        }

        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + usernameOrEmail);
        }

        String role = (user.getRole() == null || user.getRole().isBlank()) ? "USER" : user.getRole().trim().toUpperCase();
        if (role.startsWith("ROLE_")) {
            role = role.substring("ROLE_".length());
        }
        if (role.isBlank()) {
            role = "USER";
        }
        String password = user.getPassword() == null ? "" : user.getPassword();

        return org.springframework.security.core.userdetails.User
            .withUsername(user.getUsername())
            .password(password)
            .roles(role)
            .build();
    }
}
