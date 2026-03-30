package org.intervyouai.repository;

import org.intervyouai.model.TPOProfile;
import org.intervyouai.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface TPOProfileRepository extends JpaRepository<TPOProfile, UUID> {
    Optional<TPOProfile> findByUser(User user);
}
