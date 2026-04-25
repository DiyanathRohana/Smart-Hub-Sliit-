package com.smartcampus.demo.Controller;

import com.smartcampus.demo.Entity.Resources;
import com.smartcampus.demo.Service.FacilityAssetService;
import com.smartcampus.demo.Service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("api/v1/facility-assets")
public class FacilityAssetController {

    @Autowired
    private FacilityAssetService facilityAssetService;

    @Autowired
    private NotificationService notificationService;

    @PostMapping("/save")
    public ResponseEntity<?> saveFacilityAsset(@RequestBody Resources facilityAsset) {
        boolean isNewAsset = facilityAsset.get_id() == null;
        Resources savedAsset = facilityAssetService.saveFacilityAsset(facilityAsset);

        if (isNewAsset) {
            String actorUsername = savedAsset.getUsername() != null ? savedAsset.getUsername() : "User";
            notificationService.notifyAllUsers(
                actorUsername + " added a new facility asset: " + savedAsset.getTitle(),
                "NEW_FACILITY_ASSET",
                savedAsset.get_id(),
                "FACILITY_ASSET",
                savedAsset.getUserId(),
                actorUsername
            );
        }
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Facility asset saved successfully");
        response.put("facilityAssetId", savedAsset.get_id());
        
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/getall")
    public Iterable<Resources> getAllFacilityAssets() {
        return facilityAssetService.getAllFacilityAssets();
    }

    @GetMapping("/public")
    public Iterable<Resources> getPublicFacilityAssets() {
        return facilityAssetService.getPublicFacilityAssets();
    }

    @GetMapping("/user/{userId}")
    public Iterable<Resources> getFacilityAssetsByUserId(@PathVariable String userId) {
        return facilityAssetService.getFacilityAssetsByUserId(userId);
    }

    @GetMapping("/user/{userId}/public")
    public Iterable<Resources> getPublicFacilityAssetsByUserId(@PathVariable String userId) {
        return facilityAssetService.getPublicFacilityAssetsByUserId(userId);
    }

    @GetMapping("/status/{status}")
    public Iterable<Resources> getFacilityAssetsByStatus(@PathVariable String status) {
        return facilityAssetService.getFacilityAssetsByStatus(status);
    }

    @GetMapping("/user/{userId}/status/{status}")
    public Iterable<Resources> getFacilityAssetsByUserIdAndStatus(
            @PathVariable String userId, @PathVariable String status) {
        return facilityAssetService.getFacilityAssetsByUserIdAndStatus(userId, status);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getFacilityAssetById(@PathVariable String id) {
        Optional<Resources> facilityAssetOpt = facilityAssetService.getFacilityAssetById(id);
        
        if (facilityAssetOpt.isPresent()) {
            return new ResponseEntity<>(facilityAssetOpt.get(), HttpStatus.OK);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Facility asset not found");
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/edit/{id}")
    public ResponseEntity<?> updateFacilityAsset(@RequestBody Resources facilityAsset, @PathVariable String id) {
        Optional<Resources> existingAssetOpt = facilityAssetService.getFacilityAssetById(id);
        
        if (existingAssetOpt.isPresent()) {
            facilityAsset.set_id(id);
            Resources updatedAsset = facilityAssetService.saveFacilityAsset(facilityAsset);

            String actorUsername = updatedAsset.getUsername() != null ? updatedAsset.getUsername() : "User";
            notificationService.notifyAllUsers(
                actorUsername + " updated facility asset: " + updatedAsset.getTitle(),
                "EDIT_FACILITY_ASSET",
                updatedAsset.get_id(),
                "FACILITY_ASSET",
                updatedAsset.getUserId(),
                actorUsername
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Facility asset updated successfully");
            response.put("facilityAsset", updatedAsset);
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Facility asset not found");
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteFacilityAsset(@PathVariable String id) {
        Optional<Resources> facilityAssetOpt = facilityAssetService.getFacilityAssetById(id);
        
        if (facilityAssetOpt.isPresent()) {
            Resources existingAsset = facilityAssetOpt.get();
            facilityAssetService.deleteFacilityAsset(id);

            String actorUsername = existingAsset.getUsername() != null ? existingAsset.getUsername() : "User";
            notificationService.notifyAllUsers(
                actorUsername + " deleted facility asset: " + existingAsset.getTitle(),
                "DELETE_FACILITY_ASSET",
                existingAsset.get_id(),
                "FACILITY_ASSET",
                existingAsset.getUserId(),
                actorUsername
            );
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Facility asset deleted successfully");
            
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Facility asset not found");
            
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}
