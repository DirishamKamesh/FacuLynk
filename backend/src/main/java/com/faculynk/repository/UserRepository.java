package com.faculynk.repository;

import com.faculynk.model.entity.User;
import com.faculynk.model.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByInstitutionalId(String institutionalId);

    Optional<User> findByEmail(String email);

    Optional<User> findByInstitutionalIdAndAccountStatus(String institutionalId, AccountStatus status);

    Optional<User> findByEmailAndAccountStatus(String email, AccountStatus status);

    boolean existsByInstitutionalId(String institutionalId);

    boolean existsByEmail(String email);
}
