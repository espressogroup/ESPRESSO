package org.espresso.barista.service;

import org.espresso.barista.model.Keyword;

import java.util.List;

public interface SearchService {

    List<Keyword> searchKeywords(String query);
}