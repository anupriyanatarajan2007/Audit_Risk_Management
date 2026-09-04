package com.example.audit_risk_management.serviceImpl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.audit_risk_management.dto.OrganizationRequestDTO;
import com.example.audit_risk_management.dto.OrganizationResponseDTO;
import com.example.audit_risk_management.model.Organization;
import com.example.audit_risk_management.repository.OrganizationRepository;
import com.example.audit_risk_management.service.OrganizationService;

@Service
@Transactional
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;

    public OrganizationServiceImpl(OrganizationRepository organizationRepository) {
        this.organizationRepository = organizationRepository;
    }

    @Override
    public OrganizationResponseDTO createOrganization(
            OrganizationRequestDTO requestDTO) {

        if (organizationRepository.existsByOrganizationCode(
                requestDTO.getOrganizationCode())) {
            throw new RuntimeException("Organization code already exists");
        }

        if (organizationRepository.existsByContactEmail(
                requestDTO.getContactEmail())) {
            throw new RuntimeException("Contact email already exists");
        }

        Organization organization = new Organization();

        organization.setOrganizationName(
                requestDTO.getOrganizationName());

        organization.setOrganizationCode(
                requestDTO.getOrganizationCode());

        organization.setIndustry(
                requestDTO.getIndustry());

        organization.setAddress(
                requestDTO.getAddress());

        organization.setContactEmail(
                requestDTO.getContactEmail());

        organization.setContactPhone(
                requestDTO.getContactPhone());

        organization.setActive(
                requestDTO.isActive());

        Organization savedOrganization =
                organizationRepository.save(organization);

        return convertToResponseDTO(savedOrganization);
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationResponseDTO getOrganizationById(Long id) {

        Organization organization =
                organizationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Organization not found with id: " + id));

        return convertToResponseDTO(organization);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganizationResponseDTO> getAllOrganizations() {

        return organizationRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganizationResponseDTO> getOrganizationsByStatus(
            Boolean active) {

        return organizationRepository.findByActive(active)
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public OrganizationResponseDTO updateOrganization(
            Long id,
            OrganizationRequestDTO requestDTO) {

        Organization organization =
                organizationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Organization not found with id: " + id));

        /*
         * Check organization code only if it is changed
         */
        if (!organization.getOrganizationCode()
                .equals(requestDTO.getOrganizationCode())) {

            if (organizationRepository.existsByOrganizationCode(
                    requestDTO.getOrganizationCode())) {

                throw new RuntimeException(
                        "Organization code already exists");
            }
        }

        /*
         * Check contact email only if it is changed
         */
        if (organization.getContactEmail() != null
                && !organization.getContactEmail()
                        .equals(requestDTO.getContactEmail())) {

            if (organizationRepository.existsByContactEmail(
                    requestDTO.getContactEmail())) {

                throw new RuntimeException(
                        "Contact email already exists");
            }
        }

        organization.setOrganizationName(
                requestDTO.getOrganizationName());

        organization.setOrganizationCode(
                requestDTO.getOrganizationCode());

        organization.setIndustry(
                requestDTO.getIndustry());

        organization.setAddress(
                requestDTO.getAddress());

        organization.setContactEmail(
                requestDTO.getContactEmail());

        organization.setContactPhone(
                requestDTO.getContactPhone());

        organization.setActive(
                requestDTO.isActive());

        Organization updatedOrganization =
                organizationRepository.save(organization);

        return convertToResponseDTO(updatedOrganization);
    }

    @Override
    public void deleteOrganization(Long id) {

        Organization organization =
                organizationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Organization not found with id: " + id));

        organizationRepository.delete(organization);
    }

    @Override
    public OrganizationResponseDTO activateOrganization(Long id) {

        Organization organization =
                organizationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Organization not found with id: " + id));

        organization.setActive(true);

        Organization savedOrganization =
                organizationRepository.save(organization);

        return convertToResponseDTO(savedOrganization);
    }

    @Override
    public OrganizationResponseDTO deactivateOrganization(Long id) {

        Organization organization =
                organizationRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Organization not found with id: " + id));

        organization.setActive(false);

        Organization savedOrganization =
                organizationRepository.save(organization);

        return convertToResponseDTO(savedOrganization);
    }

    private OrganizationResponseDTO convertToResponseDTO(
            Organization organization) {

        OrganizationResponseDTO responseDTO =
                new OrganizationResponseDTO();

        responseDTO.setId(
                organization.getId());

        responseDTO.setOrganizationName(
                organization.getOrganizationName());

        responseDTO.setOrganizationCode(
                organization.getOrganizationCode());

        responseDTO.setIndustry(
                organization.getIndustry());

        responseDTO.setAddress(
                organization.getAddress());

        responseDTO.setContactEmail(
                organization.getContactEmail());

        responseDTO.setContactPhone(
                organization.getContactPhone());

        responseDTO.setActive(
                organization.isActive());

        return responseDTO;
    }
}