package com.smartcampus.demo.Controller;

import com.smartcampus.demo.Entity.User;
import com.smartcampus.demo.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("api/v1/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody Map<String, Object> requestBody) {
        Map<String, Object> response = new HashMap<>();

        try {
            // Extract fields from request
            String username = (String) requestBody.get("username");
            String email = (String) requestBody.get("email");
            String password = (String) requestBody.get("password");
            String secretCode = (String) requestBody.get("secretCode");

            System.out.println("Registration request received for username: " + username);

            // Check if username already exists
            boolean usernameExists = userService.existsByUsername(username);
            System.out.println("Username exists check: " + usernameExists);

            if (usernameExists) {
                response.put("success", false);
                response.put("message", "Username is already taken");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            // Check if email already exists
            boolean emailExists = userService.existsByEmail(email);
            System.out.println("Email exists check: " + emailExists);

            if (emailExists) {
                response.put("success", false);
                response.put("message", "Email is already in use");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            // Create user object
            User user = new User();
            user.setUsername(username);
            user.setEmail(email);
            user.setPassword(password);
            // Default every new user to STUDENT, elevate only when code is exactly "admin".
            user.setRole("admin".equalsIgnoreCase(secretCode) ? "ADMIN" : "STUDENT");

            // Register the user
            User registeredUser = userService.registerUser(user);
            System.out.println("User registered with ID: " + registeredUser.get_id());

            response.put("success", true);
            response.put("message", "User registered successfully");
            response.put("userId", registeredUser.get_id());

            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            System.err.println("Error during registration: " + e.getMessage());
            e.printStackTrace();

            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/update/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, @RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();

        try {
            User existing = userService.findById(userId);
            if (existing == null) {
                response.put("success", false);
                response.put("message", "User not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }

            String newUsername = body.get("username");
            String newEmail = body.get("email");
            String newPassword = body.get("password");
            String code = body.get("code");

            // Validate username uniqueness (skip if unchanged)
            if (newUsername != null && !newUsername.isBlank() && !newUsername.equals(existing.getUsername())) {
                if (userService.existsByUsername(newUsername)) {
                    response.put("success", false);
                    response.put("message", "Username is already taken");
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
                existing.setUsername(newUsername);
            }

            // Validate email uniqueness (skip if unchanged)
            if (newEmail != null && !newEmail.isBlank() && !newEmail.equals(existing.getEmail())) {
                if (userService.existsByEmail(newEmail)) {
                    response.put("success", false);
                    response.put("message", "Email is already in use");
                    return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
                }
                existing.setEmail(newEmail);
            }

            // Update password only if provided
            if (newPassword != null && !newPassword.isBlank()) {
                existing.setPassword(newPassword);
            }

            // Role upgrade via special code
            if (code != null && code.equalsIgnoreCase("admin")) {
                existing.setRole("ADMIN");
            }

            User updated = userService.updateUser(existing);

            response.put("success", true);
            response.put("message", "Account updated successfully");
            response.put("role", updated.getRole());
            return new ResponseEntity<>(response, HttpStatus.OK);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Update failed: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
