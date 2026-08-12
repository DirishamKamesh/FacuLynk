package com.faculynk.repository;

import com.faculynk.model.entity.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, String> {

    Optional<Skill> findByName(String name);

    List<Skill> findByNameIn(Collection<String> names);
}
