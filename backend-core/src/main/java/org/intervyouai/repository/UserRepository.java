package org.intervyouai.repository;

import org.intervyouai.model.Organization;
import org.intervyouai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    List<User> findByOrganization(Organization organization);
    List<User> findByOrganizationAndRole(Organization organization, org.intervyouai.model.UserRole role);
    long countByOrganizationAndRole(Organization organization, org.intervyouai.model.UserRole role);
}
