package org.espresso.barista;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface Repository extends JpaRepository <SolidIndex,Long>{

    List<SolidIndex> findByNameContaining(String keyword);
}
