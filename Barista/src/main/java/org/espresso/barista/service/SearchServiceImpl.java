package org.espresso.barista.service;

import org.espresso.barista.model.Keyword;
import org.espresso.barista.model.KeywordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SearchServiceImpl implements SearchService {

    private final KeywordRepository keywordRepository;

    @Autowired
    public SearchServiceImpl(KeywordRepository keywordRepository) {
        this.keywordRepository = keywordRepository;
    }

    @Override
    public List<Keyword> searchKeywords(String query) {
        return keywordRepository.findByTermContaining(query);
    }

}
