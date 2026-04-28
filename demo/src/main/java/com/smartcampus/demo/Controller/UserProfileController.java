package com.smartcampus.demo.Controller;

import com.smartcampus.demo.Entity.UserProfile;
import com.smartcampus.demo.Service.UserProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("api/v1/profiles")
public class UserProfileController {

    @Autowired
    private UserProfileService userProfileService;

    @PostMapping("/save")
    public ResponseEntity<?> saveUserProfile(@RequestBody UserProfile userProfile) {
        UserProfile savedProfile = userProfileService.saveUserProfile(userProfile);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "User profile saved successfully");
        response.put("profileId", savedProfile.get_id());
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/getall")
    public Iterable<UserProfile> getAllUserProfiles() {
        return userProfileService.getAllUserProfiles();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserProfileByUserId(@PathVariable String userId) {
        UserProfile userProfile = userProfileService.getUserProfileByUserId(userId);
        
        if (userProfile != null) {
            return new ResponseEntity<>(userProfile, HttpStatus.OK);
        } else {
            // Create a new profile if one doesn't exist
            userProfile = userProfileService.getOrCreateUserProfile(userId);
            return new ResponseEntity<>(userProfile, HttpStatus.OK);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserProfileById(@PathVariable String id) {
        Optional<UserProfile> userProfileOpt = userProfileService.getUserProfileById(id);
        
        if (userProfileOpt.isPresent()) {
            return new ResponseEntity<>(userProfileOpt.get(), HttpStatus.OK);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "User profile not found");
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> updateUserProfile(@RequestBody UserProfile userProfile, @PathVariable String id) {
        Optional<UserProfile> existingProfileOpt = userProfileService.getUserProfileById(id);
        
        if (existingProfileOpt.isPresent()) {
            userProfile.set_id(id);
            UserProfile updatedProfile = userProfileService.saveUserProfile(userProfile);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User profile updated successfully");
            response.put("profile", updatedProfile);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "User profile not found");
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteUserProfile(@PathVariable String id) {
        Optional<UserProfile> userProfileOpt = userProfileService.getUserProfileById(id);
        
        if (userProfileOpt.isPresent()) {
            userProfileService.deleteUserProfile(id);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "User profile deleted successfully");
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "User profile not found");
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}
