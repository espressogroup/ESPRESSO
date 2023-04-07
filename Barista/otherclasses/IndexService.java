package org.espresso.barista;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class IndexService {

    @Autowired
    private Repository indexRepository;

    public List<SolidIndex> search(String keyword) {
        return indexRepository.findByNameContaining(keyword);
    }
}
