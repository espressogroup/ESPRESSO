package com.ibm.siapi.search;

/**
 * @author Reza Moosaei 27.02.23 17:45
 */
public class SearchService {

    public static RemoteFederator getFederator(Object inputOne,Object inputTwo) {
        return new RemoteFederator();
    }

    public static Searchable getSearchable(Object inputOne,Object inputTwo){
        return new Searchable();
    }
}
