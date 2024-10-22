package com.example.local_festival_web.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.local_festival_web.model.Festival;

public interface FestivalRepository extends JpaRepository<Festival, Long> {
    Festival findByContentId(String contentid);
}
