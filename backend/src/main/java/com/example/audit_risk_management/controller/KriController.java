
package com.example.audit_risk_management.controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.audit_risk_management.dto.ApiResponse;
import com.example.audit_risk_management.dto.KriRequestDTO;
import com.example.audit_risk_management.dto.KriResponseDTO;
import com.example.audit_risk_management.enums.KriStatus;
import com.example.audit_risk_management.enums.RiskCategory;
import com.example.audit_risk_management.model.Department;
import com.example.audit_risk_management.service.KriService;

@RestController
@RequestMapping("/api/kri")
@CrossOrigin(origins = "*")
public class KriController {

    @Autowired
    private KriService kriService;


    // ============================================================
    // CREATE KRI
    // POST /api/kri
    // ============================================================

    @PostMapping
    @PreAuthorize("hasAuthority('KRI_CREATE')")
    public ApiResponse<KriResponseDTO> createKri(
            @RequestBody KriRequestDTO request) {

        return kriService.createKri(request);
    }


    // ============================================================
    // GET ALL KRIs
    // GET /api/kri
    // ============================================================

    @GetMapping
    @PreAuthorize("hasAuthority('KRI_READ')")
    public ApiResponse<List<KriResponseDTO>> getAll() {

        return kriService.getAllKris();
    }


    // ============================================================
    // GET KRI BY ID
    // GET /api/kri/{id}
    // ============================================================

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('KRI_READ')")
    public ApiResponse<KriResponseDTO> getById(
            @PathVariable Long id) {

        return kriService.getKriById(id);
    }


    // ============================================================
    // UPDATE KRI
    // PUT /api/kri/{id}
    // ============================================================

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('KRI_UPDATE')")
    public ApiResponse<KriResponseDTO> update(
            @PathVariable Long id,
            @RequestBody KriRequestDTO request) {

        return kriService.updateKri(id, request);
    }


    // ============================================================
    // DELETE KRI
    // DELETE /api/kri/{id}
    // ============================================================

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('KRI_DELETE')")
    public ApiResponse<Void> delete(
            @PathVariable Long id) {

        return kriService.deleteKri(id);
    }


    // ============================================================
    // GET BY RISK
    // GET /api/kri/risk/{riskId}
    // ============================================================

    @GetMapping("/risk/{riskId}")
    @PreAuthorize("hasAuthority('KRI_READ')")
    public ApiResponse<List<KriResponseDTO>> getByRisk(
            @PathVariable Long riskId) {

        return kriService.getKrisByRisk(riskId);
    }


    // ============================================================
    // GET BY STATUS
    // GET /api/kri/status/{status}
    // ============================================================

    @GetMapping("/status/{status}")
    @PreAuthorize("hasAuthority('KRI_READ')")
    public ApiResponse<List<KriResponseDTO>> getByStatus(
            @PathVariable KriStatus status) {

        return kriService.getKrisByStatus(status);
    }


    // ============================================================
    // UPDATE STATUS
    // PUT /api/kri/{id}/status
    // ============================================================

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAuthority('KRI_STATUS_UPDATE')")
    public ApiResponse<KriResponseDTO> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        KriStatus status =
                KriStatus.valueOf(request.get("status"));

        return kriService.updateStatus(id, status);
    }


    // ============================================================
    // GET BY DEPARTMENT
    // GET /api/kri/department/{department}
    // ============================================================

    @GetMapping("/department/{department}")
    @PreAuthorize("hasAuthority('KRI_READ')")
    public ApiResponse<List<KriResponseDTO>> getByDepartment(
            @PathVariable Department department) {

        return kriService.getKrisByDepartment(department);
    }


    // ============================================================
    // GET BY RISK CATEGORY
    // GET /api/kri/category/{category}
    // ============================================================

    @GetMapping("/category/{category}")
    @PreAuthorize("hasAuthority('KRI_READ')")
    public ApiResponse<List<KriResponseDTO>> getByCategory(
            @PathVariable RiskCategory category) {

        return kriService.getKrisByRiskCategory(category);
    }


    // ============================================================
    // GET BY OWNER
    // GET /api/kri/owner/{ownerId}
    // ============================================================

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasAuthority('KRI_READ')")
    public ApiResponse<List<KriResponseDTO>> getByOwner(
            @PathVariable Long ownerId) {

        return kriService.getKrisByOwner(ownerId);
    }


    // ============================================================
    // SEARCH KRI
    // GET /api/kri/search/{keyword}
    // ============================================================

    @GetMapping("/search/{keyword}")
    @PreAuthorize("hasAuthority('KRI_SEARCH')")
    public ApiResponse<List<KriResponseDTO>> search(
            @PathVariable String keyword) {

        return kriService.searchKri(keyword);
    }


    // ============================================================
    // CRITICAL KRIs
    // GET /api/kri/critical
    // ============================================================

    @GetMapping("/critical")
    @PreAuthorize("hasAuthority('KRI_CRITICAL')")
    public ApiResponse<List<KriResponseDTO>> getCriticalKris() {

        return kriService.getCriticalKris();
    }


    // ============================================================
    // DASHBOARD
    // GET /api/kri/dashboard
    // ============================================================

    @GetMapping("/dashboard")
    @PreAuthorize("hasAuthority('KRI_DASHBOARD')")
    public ApiResponse<Map<String, Long>> getDashboard() {

        return kriService.getDashboard();
    }
}
