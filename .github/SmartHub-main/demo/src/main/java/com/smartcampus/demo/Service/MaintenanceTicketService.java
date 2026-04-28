package com.smartcampus.demo.Service;

import com.smartcampus.demo.Entity.MaintenanceTicket;
import com.smartcampus.demo.Repo.MaintenanceTicketRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.Set;

@Service
public class MaintenanceTicketService {

    private static final Set<String> VALID_STATUSES = Set.of("OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED");

    @Autowired
    private MaintenanceTicketRepo maintenanceTicketRepo;

    public MaintenanceTicket createTicket(MaintenanceTicket ticket) {
        ticket.setStatus("OPEN");
        ticket.setCreatedAt(new Date());
        ticket.setUpdatedAt(new Date());
        return maintenanceTicketRepo.save(ticket);
    }

    public List<MaintenanceTicket> getAllTickets() {
        return maintenanceTicketRepo.findAllByOrderByCreatedAtDesc();
    }

    public List<MaintenanceTicket> getTicketsByRequester(String requesterId) {
        return maintenanceTicketRepo.findByRequesterId(requesterId);
    }

    public MaintenanceTicket findById(String id) {
        return maintenanceTicketRepo.findById(id).orElse(null);
    }

    public boolean deleteTicket(String id) {
        if (!maintenanceTicketRepo.existsById(id)) {
            return false;
        }
        maintenanceTicketRepo.deleteById(id);
        return true;
    }

    public MaintenanceTicket updateStatus(String id, String status, String resolutionNotes) {
        if (!VALID_STATUSES.contains(status)) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        MaintenanceTicket ticket = maintenanceTicketRepo.findById(id).orElse(null);
        if (ticket == null) {
            return null;
        }
        ticket.setStatus(status);
        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            ticket.setTechnicianResolutionNotes(resolutionNotes.trim());
        }
        ticket.setUpdatedAt(new Date());
        return maintenanceTicketRepo.save(ticket);
    }
}
