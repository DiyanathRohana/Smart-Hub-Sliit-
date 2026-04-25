package com.smartcampus.demo.Controller;

import com.smartcampus.demo.Entity.MaintenanceTicket;
import com.smartcampus.demo.Service.MaintenanceTicketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/maintenance-tickets")
public class MaintenanceTicketController {

    @Autowired
    private MaintenanceTicketService maintenanceTicketService;

    /** Any authenticated user can submit a maintenance ticket. */
    @PostMapping
    public ResponseEntity<?> createTicket(@RequestBody MaintenanceTicket ticket) {
        Map<String, Object> response = new HashMap<>();
        try {
            if (ticket.getResource() == null || ticket.getResource().isBlank()) {
                response.put("success", false);
                response.put("message", "Resource / Location is required");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            if (ticket.getCategory() == null || ticket.getCategory().isBlank()) {
                response.put("success", false);
                response.put("message", "Category is required");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            if (ticket.getDescription() == null || ticket.getDescription().isBlank()) {
                response.put("success", false);
                response.put("message", "Description is required");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            MaintenanceTicket saved = maintenanceTicketService.createTicket(ticket);
            response.put("success", true);
            response.put("message", "Maintenance ticket submitted successfully");
            response.put("ticketId", saved.get_id());
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to submit ticket: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /** Get all tickets — admin/technician only. */
    @GetMapping("/all")
    public ResponseEntity<?> getAllTickets() {
        List<MaintenanceTicket> tickets = maintenanceTicketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    /** Get tickets submitted by a specific user. */
    @GetMapping("/user/{requesterId}")
    public ResponseEntity<?> getTicketsByRequester(@PathVariable String requesterId) {
        List<MaintenanceTicket> tickets = maintenanceTicketService.getTicketsByRequester(requesterId);
        return ResponseEntity.ok(tickets);
    }

    /** Get a single ticket by ID. */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable String id) {
        MaintenanceTicket ticket = maintenanceTicketService.findById(id);
        if (ticket == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Ticket not found");
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(ticket);
    }

    /** Delete a ticket — admin/technician only (enforced via SecurityConfig). */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable String id) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean deleted = maintenanceTicketService.deleteTicket(id);
            if (!deleted) {
                response.put("success", false);
                response.put("message", "Ticket not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            response.put("success", true);
            response.put("message", "Ticket deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to delete ticket: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    /** Update ticket status — technician only. */
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        Map<String, Object> response = new HashMap<>();
        try {
            String status = body.get("status");
            String resolutionNotes = body.get("resolutionNotes");
            if (status == null || status.isBlank()) {
                response.put("success", false);
                response.put("message", "Status is required");
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
            MaintenanceTicket updated = maintenanceTicketService.updateStatus(id, status, resolutionNotes);
            if (updated == null) {
                response.put("success", false);
                response.put("message", "Ticket not found");
                return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
            }
            response.put("success", true);
            response.put("message", "Ticket status updated");
            response.put("ticket", updated);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to update ticket: " + e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
