package org.intervyouai.repository;

import org.intervyouai.model.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, UUID> {
}
