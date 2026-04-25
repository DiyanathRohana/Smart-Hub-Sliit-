package com.smartcampus.demo.Config;

import com.smartcampus.demo.Entity.User;
import com.smartcampus.demo.Service.UserProfileService;
import com.smartcampus.demo.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.web.authentication.SavedRequestAwareAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;

/**
 * Custom OAuth2 Success Handler that:
 * 1. Intercepts successful OAuth2 login
 * 2. Checks if user exists in database
 * 3. Creates new user if they don't exist
 * 4. Redirects to the React frontend dashboard after successful authentication
 */
@Component
public class OAuth2AuthenticationSuccessHandler extends SavedRequestAwareAuthenticationSuccessHandler {

    @Autowired
    private UserService userService;

    @Autowired
    private UserProfileService userProfileService;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
            throws ServletException, IOException {
        
        System.out.println("🔐 OAuth2 Authentication Success triggered");
        System.out.println("   Principal type: " + authentication.getPrincipal().getClass().getSimpleName());
        
        // Get the OidcUser (Google OAuth2User)
        if (authentication.getPrincipal() instanceof OidcUser) {
            OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
            
            // Extract user information from Google
            String email = oidcUser.getEmail();
            String name = oidcUser.getFullName();

            System.out.println("📧 OAuth2 Email: " + email);
            System.out.println("📝 OAuth2 Name: " + name);
            
            // Check if user already exists
            User existingUser = userService.findByEmail(email);
            
            if (existingUser == null) {
                // Create new user from OAuth2 data
                User newUser = new User();
                newUser.set_id(UUID.randomUUID().toString());
                newUser.setUsername(email.split("@")[0]); // Use email prefix as username
                newUser.setEmail(email);
                newUser.setPassword(""); // OAuth2 users don't need passwords
                newUser.setRole("STUDENT"); // Default role
                newUser.setEmailVerified(true); // Google verifies emails
                
                // Save user
                userService.registerUser(newUser);
                
                // Create user profile
                userProfileService.getOrCreateUserProfile(newUser.get_id());
                
                System.out.println("✅ NEW OAUTH2 USER CREATED: " + email);
            } else {
                System.out.println("✅ EXISTING OAUTH2 USER LOGGED IN: " + email);
            }
        } else {
            System.out.println("⚠️  Principal is not OidcUser: " + authentication.getPrincipal().getClass().getName());
        }
        
        setDefaultTargetUrl(frontendUrl + "/");
        super.onAuthenticationSuccess(request, response, authentication);
    }
}
