package com.smartcampus.demo.Controller;

import com.smartcampus.demo.Entity.Booking;
import com.smartcampus.demo.Entity.Resources;
import com.smartcampus.demo.Entity.User;
import com.smartcampus.demo.Repo.FacilityAssetRepo;
import com.smartcampus.demo.Service.BookingService;
import com.smartcampus.demo.Service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;



@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserService userService;

    @Autowired
    private FacilityAssetRepo facilityAssetRepo;

    /** Any authenticated user can create a booking request. */
    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody Booking booking, Authentication authentication) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (booking.getResourceId() == null || booking.getResourceId().isBlank()) {
                response.put("success", false);
                response.put("message", "Resource ID is required");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            if (booking.getDate() == null || booking.getStartTime() == null || booking.getEndTime() == null) {
                response.put("success", false);
                response.put("message", "Date, start time and end time are required");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }

            // Force trusted requester identity from authenticated session.
            User currentUser = resolveCurrentUser(authentication);
            if (currentUser != null) {
                booking.setUserId(currentUser.get_id());
                booking.setUsername(currentUser.getUsername());
            }

            // Force canonical resource title from DB to avoid stale/mismatched UI values.
            Resources resource = facilityAssetRepo.findById(booking.getResourceId()).orElse(null);
            if (resource != null && resource.getTitle() != null && !resource.getTitle().isBlank()) {
                booking.setResourceTitle(resource.getTitle());
            }

            Booking saved = bookingService.createBooking(booking);
            response.put("success", true);
            response.put("message", "Booking request submitted successfully");
            response.put("bookingId", saved.get_id());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to create booking: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /** Get all bookings — admin/technician only (enforced via SecurityConfig). */
    @GetMapping("/all")
    public ResponseEntity<?> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(bookings);
    }

    /** Get bookings for the currently logged-in user. */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getBookingsByUser(@PathVariable String userId) {
        List<Booking> bookings = bookingService.getBookingsByUser(userId);
        return ResponseEntity.ok(bookings);
    }

    /** Get bookings for the authenticated user based on current session. */
    @GetMapping("/me")
    public ResponseEntity<?> getMyBookings(Authentication authentication) {
        User currentUser = resolveCurrentUser(authentication);
        if (currentUser == null || currentUser.get_id() == null || currentUser.get_id().isBlank()) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Authenticated user not found");
            return new ResponseEntity<>(response, HttpStatus.UNAUTHORIZED);
        }
        List<Booking> bookings = bookingService.getBookingsByUser(currentUser.get_id());
        return ResponseEntity.ok(bookings);
    }

    /** Get all bookings for a specific resource (availability check). */
    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<?> getBookingsByResource(@PathVariable String resourceId) {
        List<Booking> bookings = bookingService.getBookingsByResource(resourceId);
        return ResponseEntity.ok(bookings);
    }

    /** Delete a booking — admin/technician only (enforced via SecurityConfig). */
    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> deleteBooking(@PathVariable String bookingId) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean deleted = bookingService.deleteBooking(bookingId);
            if (!deleted) {
                response.put("success", false);
                response.put("message", "Booking not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            response.put("success", true);
            response.put("message", "Booking deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete booking: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /** Update booking status — admin/technician only (enforced via SecurityConfig). */
    @PutMapping("/{bookingId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String bookingId,
            @RequestBody Map<String, String> body,
            Authentication authentication) {

        Map<String, Object> response = new HashMap<>();
        String newStatus = body.get("status");
        String reason = body.get("reason");
        if (newStatus == null || newStatus.isBlank()) {
            response.put("success", false);
            response.put("message", "Status is required");
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }

        try {
            String updatedBy = authentication != null ? authentication.getName() : "system";
            Booking updated = bookingService.updateStatus(bookingId, newStatus.toUpperCase(), updatedBy, reason);
            if (updated == null) {
                response.put("success", false);
                response.put("message", "Booking not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            response.put("success", true);
            response.put("message", "Status updated to " + updated.getStatus());
            response.put("status", updated.getStatus());
            response.put("rejectionReason", updated.getRejectionReason());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    private User resolveCurrentUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String principalName = authentication.getName();
        if (principalName == null || principalName.isBlank()) {
            return null;
        }
        User byUsername = userService.findByUsername(principalName);
        if (byUsername != null) {
            return byUsername;
        }
        return userService.findByEmail(principalName);
    }
}
