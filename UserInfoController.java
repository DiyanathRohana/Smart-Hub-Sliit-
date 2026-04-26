package com.smartcampus.demo.Controller;

import com.smartcampus.demo.Entity.User;
import com.smartcampus.demo.Service.UserService;
import com.smartcampus.demo.Service.OAuth2UserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Example controller demonstrating how to access OAuth2 user information.
 * This endpoint shows both Direct Authentication approach and Service-based approach.
 */
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/user")
public class UserInfoController {

    @Autowired
    private OAuth2UserDetailsService oauth2UserDetailsService;

    @Autowired
    private UserService userService;

    /**
     * Get current authenticated user's information.
     * Works for both Form Login and OAuth2 Login.
     * 
     * @param authentication Spring Security Authentication object (injected automatically)
     * @return User information (email, name, picture if available)
     */
    @GetMapping("/info")
    public ResponseEntity<?> getUserInfo(Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        if (authentication == null || !authentication.isAuthenticated()) {
            response.put("success", false);
            response.put("message", "User not authenticated");
            return ResponseEntity.status(401).body(response);
        }

        response.put("success", true);
        response.put("authenticated", true);
        response.put("principal", authentication.getPrincipal().toString());

        String resolvedEmail = null;
        String resolvedName = null;
        String resolvedUsername = authentication.getName();

        // Check if OAuth2 authenticated
        if (oauth2UserDetailsService.isOAuth2Authenticated()) {
            response.put("authType", "OAuth2");
            response.put("provider", oauth2UserDetailsService.getProvider());
            resolvedEmail = oauth2UserDetailsService.getUserEmail();
            resolvedName = oauth2UserDetailsService.getUserName();
            response.put("email", resolvedEmail);
            response.put("name", resolvedName);
            response.put("picture", oauth2UserDetailsService.getUserPicture());
            response.put("attributes", oauth2UserDetailsService.getCurrentUserAttributes());
        } else {
            response.put("authType", "FormLogin");
            response.put("principal", authentication.getPrincipal());
            response.put("name", resolvedUsername);
        }

        User dbUser = null;
        if (resolvedEmail != null && !resolvedEmail.isBlank()) {
            dbUser = userService.findByEmail(resolvedEmail);
        }
        if (dbUser == null && resolvedUsername != null && !resolvedUsername.isBlank()) {
            dbUser = userService.findByUsername(resolvedUsername);
        }
        if (dbUser == null && resolvedUsername != null && resolvedUsername.contains("@")) {
            dbUser = userService.findByEmail(resolvedUsername);
        }

        if (dbUser != null) {
            response.put("userId", dbUser.get_id());
            response.put("username", dbUser.getUsername());
            response.put("email", dbUser.getEmail());
            response.put("role", dbUser.getRole());
            if (response.get("name") == null) {
                response.put("name", dbUser.getUsername());
            }
        } else {
            response.put("username", resolvedUsername);
            if (resolvedEmail != null && !resolvedEmail.isBlank()) {
                response.put("email", resolvedEmail);
            } else if (resolvedUsername != null && resolvedUsername.contains("@")) {
                response.put("email", resolvedUsername);
            }
            if (response.get("name") == null) {
                response.put("name", resolvedUsername);
            }
        }

        return ResponseEntity.ok(response);
    }

    /**
     * Update the currently authenticated user's own profile fields (username, email, password).
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateOwnProfile(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        Map<String, Object> response = new HashMap<>();

        if (authentication == null || !authentication.isAuthenticated()) {
            response.put("success", false);
            response.put("message", "User not authenticated");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }

        String principal = authentication.getName();
        User dbUser = userService.findByUsername(principal);
        if (dbUser == null && principal != null && principal.contains("@")) {
            dbUser = userService.findByEmail(principal);
        }
        if (dbUser == null) {
            response.put("success", false);
            response.put("message", "User not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }

        String newUsername = body.get("username");
        String newEmail    = body.get("email");
        String newPassword = body.get("password");

        if (newUsername != null && !newUsername.isBlank()) {
            String trimmed = newUsername.trim();
            User existing = userService.findByUsername(trimmed);
            if (existing != null && !existing.get_id().equals(dbUser.get_id())) {
                response.put("success", false);
                response.put("message", "Username is already taken");
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
            }
            dbUser.setUsername(trimmed);
        }

        if (newEmail != null && !newEmail.isBlank()) {
            String trimmed = newEmail.trim();
            User existing = userService.findByEmail(trimmed);
            if (existing != null && !existing.get_id().equals(dbUser.get_id())) {
                response.put("success", false);
                response.put("message", "Email is already in use");
                return new ResponseEntity<>(response, HttpStatus.CONFLICT);
            }
            dbUser.setEmail(trimmed);
        }

        if (newPassword != null && !newPassword.isBlank()) {
            dbUser.setPassword(newPassword.trim());
        }

        userService.updateUser(dbUser);

        response.put("success", true);
        response.put("message", "Profile updated successfully");
        response.put("userId",   dbUser.get_id());
        response.put("username", dbUser.getUsername());
        response.put("email",    dbUser.getEmail());
        return ResponseEntity.ok(response);
    }

    /**
     * Get only OAuth2 user details (Google).
     * Returns null if user is authenticated via form login.
     * 
     * @return OAuth2 user details (name, email, picture)
     */
    @GetMapping("/oauth2-details")
    public ResponseEntity<?> getOAuth2Details() {
        OidcUser oidcUser = oauth2UserDetailsService.getCurrentOidcUser();

        if (oidcUser == null) {
            return ResponseEntity.status(400).body(Map.of(
                "error", "User is not authenticated via OAuth2"
            ));
        }

        Map<String, Object> details = new HashMap<>();
        details.put("email", oidcUser.getEmail());
        details.put("name", oidcUser.getFullName());
        details.put("givenName", oidcUser.getGivenName());
        details.put("familyName", oidcUser.getFamilyName());
        details.put("picture", oidcUser.getAttributes().get("picture"));
        details.put("emailVerified", oidcUser.getAttribute("email_verified"));
        details.put("locale", oidcUser.getAttribute("locale"));

        return ResponseEntity.ok(details);
    }

    /**
     * Endpoint showing direct use of OidcUser parameter injection.
     * Spring Security will inject the authenticated OidcUser automatically.
     * This only works if user is authenticated via OAuth2/OIDC.
     * 
     * @param oidcUser Injected by Spring Security if OAuth2 authenticated
     * @return User details or error if not OAuth2 authenticated
     */
    @GetMapping("/oauth2-simple")
    public ResponseEntity<?> getOAuth2UserSimple(OidcUser oidcUser) {
        if (oidcUser == null) {
            return ResponseEntity.status(400).body(Map.of(
                "error", "User is not authenticated via OAuth2"
            ));
        }

        return ResponseEntity.ok(Map.of(
            "email", oidcUser.getEmail(),
            "name", oidcUser.getFullName(),
            "picture", oidcUser.getAttributes().get("picture")
        ));
    }
}
